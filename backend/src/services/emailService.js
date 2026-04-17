const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendEmail = async (to, subject, htmlContent, textContent) => {
  const params = {
    Source: process.env.AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: htmlContent,
        },
        Text: {
          Data: textContent,
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log('Email sent successfully:', response.MessageId);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendOrderConfirmation = async (email, orderDetails) => {
  const htmlContent = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
    <p><strong>Total:</strong> $${orderDetails.totalAmount}</p>
    <p><strong>Expected Delivery:</strong> ${orderDetails.estimatedDeliveryDate}</p>
    <p>We'll send you a tracking number once your order ships.</p>
  `;

  const textContent = `Order Confirmation\nOrder ID: ${orderDetails.orderId}\nTotal: $${orderDetails.totalAmount}`;

  return sendEmail(email, 'Order Confirmation', htmlContent, textContent);
};

const sendVendorApprovalEmail = async (vendorEmail, storeName, status) => {
  const message = status === 'approved' 
    ? 'Your vendor account has been approved!'
    : 'Your vendor account application has been rejected.';

  const htmlContent = `
    <h2>Vendor Application ${status.toUpperCase()}</h2>
    <p>Dear Vendor,</p>
    <p>${message}</p>
    <p><strong>Store Name:</strong> ${storeName}</p>
  `;

  const textContent = `Vendor Application ${status.toUpperCase()}\n${message}`;

  return sendEmail(vendorEmail, `Vendor Application ${status}`, htmlContent, textContent);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendVendorApprovalEmail,
};
