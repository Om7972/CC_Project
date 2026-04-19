const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { connect } = require('../lib/db');
const { getModels } = require('../lib/models');
const { weeklyVendorReportHtml } = require('../lib/emailTemplates');

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

function startOfUtcDay(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

async function sendSes({ to, subject, html, text }) {
  const from = process.env.AWS_SES_FROM_EMAIL;
  if (!from) throw new Error('AWS_SES_FROM_EMAIL is not set');
  return ses.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html },
          Text: { Data: text || subject },
        },
      },
    })
  );
}

module.exports.handler = async () => {
  await connect();
  const { Order, AnalyticsDaily, Vendor } = getModels();

  const now = new Date();
  const yesterday = addDays(startOfUtcDay(now), -1);
  const dayEnd = addDays(yesterday, 1);

  const pipeline = [
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: yesterday, $lt: dayEnd },
      },
    },
    {
      $group: {
        _id: '$vendorId',
        orderCount: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
        unitsSold: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', '$$this.quantity'] } } } },
      },
    },
  ];

  const agg = await Order.aggregate(pipeline);

  for (const row of agg) {
    if (!row._id) continue;
    await AnalyticsDaily.findOneAndUpdate(
      { vendorId: row._id, date: yesterday },
      {
        $set: {
          orderCount: row.orderCount,
          revenue: row.revenue,
          unitsSold: row.unitsSold || 0,
          currency: 'USD',
        },
      },
      { upsert: true, new: true }
    );
  }

  const weeklyReportWeekday = Number(process.env.WEEKLY_REPORT_WEEKDAY || '0');
  if (now.getUTCDay() !== weeklyReportWeekday) {
    return { ok: true, dailyAggregated: agg.length, weeklyEmail: false };
  }

  const weekEnd = startOfUtcDay(now);
  const weekStart = addDays(weekEnd, -7);

  const weeklyAgg = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: weekStart, $lt: weekEnd },
      },
    },
    {
      $group: {
        _id: {
          vendorId: '$vendorId',
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
        },
        orderCount: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
        unitsSold: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', '$$this.quantity'] } } } },
      },
    },
  ]);

  const byVendor = new Map();
  for (const row of weeklyAgg) {
    const vid = String(row._id.vendorId);
    if (!byVendor.has(vid)) byVendor.set(vid, []);
    byVendor.get(vid).push({
      day: row._id.day,
      orders: row.orderCount,
      revenue: row.revenue,
      units: row.unitsSold || 0,
    });
  }

  const vendors = await Vendor.find({ status: 'approved' }).populate('userId', 'email');
  let emails = 0;

  for (const v of vendors) {
    const email = v.userId?.email;
    if (!email) continue;
    const rows = (byVendor.get(String(v._id)) || []).sort((a, b) => a.day.localeCompare(b.day));
    const weekLabel = `${weekStart.toISOString().slice(0, 10)} → ${addDays(weekEnd, -1).toISOString().slice(0, 10)}`;
    const html = weeklyVendorReportHtml({
      storeName: v.storeName,
      weekLabel,
      rows: rows.length
        ? rows.map((r) => ({
            day: r.day,
            orders: r.orders,
            units: r.units,
            revenue: r.revenue,
          }))
        : [
            {
              day: '—',
              orders: 0,
              units: 0,
              revenue: 0,
            },
          ],
    });

    await sendSes({
      to: email,
      subject: `CloudMart weekly report · ${v.storeName}`,
      html,
      text: `Weekly summary for ${v.storeName} (${weekLabel})`,
    });
    emails += 1;
  }

  return { ok: true, dailyAggregated: agg.length, weeklyEmail: true, weeklyEmailsSent: emails };
};
