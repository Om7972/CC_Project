const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { connect } = require('../lib/db');
const { getModels } = require('../lib/models');
const { orderConfirmationHtml, vendorNewOrderHtml } = require('../lib/emailTemplates');

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function sendSes({ to, subject, html, text }) {
  const from = process.env.AWS_SES_FROM_EMAIL;
  if (!from) throw new Error('AWS_SES_FROM_EMAIL is not set');

  const cmd = new SendEmailCommand({
    Source: from,
    Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        Text: { Data: text || subject },
      },
    },
  });
  return ses.send(cmd);
}

async function processRecord(body) {
  const { Order, Product, Vendor, User, NotificationLog } = getModels();
  const event = typeof body === 'string' ? JSON.parse(body) : body;

  if (event.eventType && event.eventType !== 'ORDER_PLACED') {
    return { skipped: true, reason: 'unsupported_event' };
  }

  const orderId = event.orderId;
  if (!orderId) {
    return { skipped: true, reason: 'missing_orderId' };
  }

  const order = await Order.findOne({ orderId })
    .populate('buyerId', 'email name')
    .populate('vendorId', 'storeName userId');

  if (!order) {
    throw new Error(`Order not found for orderId=${orderId}`);
  }

  for (const line of order.items || []) {
    if (!line.productId) continue;
    const qty = Number(line.quantity) || 0;
    if (qty <= 0) continue;
    const updated = await Product.findOneAndUpdate(
      { _id: line.productId, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );
    if (!updated) {
      console.warn(`Insufficient stock for product ${line.productId}, order ${orderId}`);
    }
  }

  const vendorDoc = order.vendorId;
  const storeName = vendorDoc?.storeName || 'Vendor';
  let vendorEmail = event.vendorEmail;

  if (!vendorEmail && vendorDoc?.userId) {
    const u = await User.findById(vendorDoc.userId).select('email');
    vendorEmail = u?.email;
  }

  const buyerEmail = order.buyerId?.email || event.buyerEmail;
  const items = (order.items || []).map((i) => ({
    name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));

  const buyerHtml = orderConfirmationHtml({
    orderId: order.orderId,
    totalAmount: order.totalAmount,
    items,
    storeName,
  });

  if (buyerEmail) {
    await sendSes({
      to: buyerEmail,
      subject: `Your CloudMart order ${order.orderId} is confirmed`,
      html: buyerHtml,
      text: `Order ${order.orderId} confirmed. Total $${order.totalAmount}.`,
    });
  }

  if (vendorEmail) {
    const vHtml = vendorNewOrderHtml({
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      buyerEmail: buyerEmail || 'unknown',
      items,
    });
    await sendSes({
      to: vendorEmail,
      subject: `New CloudMart order ${order.orderId}`,
      html: vHtml,
      text: `New order ${order.orderId} total $${order.totalAmount}`,
    });
  }

  await NotificationLog.create({
    vendorId: order.vendorId._id || order.vendorId,
    orderId: order.orderId,
    channel: 'push',
    status: 'queued',
    payload: {
      title: 'New order',
      body: `Order ${order.orderId} — $${Number(order.totalAmount).toFixed(2)}`,
      data: { orderId: order.orderId, totalAmount: order.totalAmount },
    },
  });

  return { ok: true, orderId: order.orderId };
}

module.exports.handler = async (event) => {
  await connect();
  const batchItemFailures = [];

  for (const record of event.Records || []) {
    try {
      await processRecord(record.body);
    } catch (err) {
      console.error('orderProcessor error', err);
      if (record.messageId) {
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }
  }

  return { batchItemFailures };
};
