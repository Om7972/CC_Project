const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendMessage = async (queueUrl, messageBody, delaySeconds = 0) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody),
    DelaySeconds: delaySeconds,
  };

  try {
    const command = new SendMessageCommand(params);
    const response = await sqsClient.send(command);
    console.log('Message sent to SQS:', response.MessageId);
    return response;
  } catch (error) {
    console.error('Error sending message to SQS:', error);
    throw error;
  }
};

const publishOrderEvent = async (orderData) => {
  const messageBody = {
    eventType: 'ORDER_PLACED',
    orderId: orderData.orderId,
    buyerId: orderData.buyerId,
    vendorId: orderData.vendorId,
    totalAmount: orderData.totalAmount,
    buyerEmail: orderData.buyerEmail,
    vendorEmail: orderData.vendorEmail,
    items: orderData.items,
    timestamp: new Date().toISOString(),
  };

  return sendMessage(process.env.AWS_SQS_QUEUE_URL, messageBody);
};

module.exports = {
  sendMessage,
  publishOrderEvent,
  sqsClient,
};
