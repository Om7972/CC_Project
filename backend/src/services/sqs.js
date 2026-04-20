const { SendMessageCommand } = require('@aws-sdk/client-sqs');
const { sqs } = require('../config/aws');

const send = (queueUrl, body) => sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(body) }));

const publishOrderEvent = (orderId, eventType) => send(process.env.ORDER_EVENTS_QUEUE_URL, { orderId, eventType });
const publishEmailJob = (to, template, data) => send(process.env.EMAIL_QUEUE_URL, { to, template, data });
const publishImageResizeJob = (s3Key, productId) => send(process.env.IMAGE_RESIZE_QUEUE_URL, { s3Key, productId });

module.exports = { publishOrderEvent, publishEmailJob, publishImageResizeJob };
