const { SendTemplatedEmailCommand } = require('@aws-sdk/client-ses');
const { ses } = require('../config/aws');

const sendEmail = async (to, templateName, data) => {
  const cmd = new SendTemplatedEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Template: templateName,
    TemplateData: JSON.stringify(data || {}),
  });
  return ses.send(cmd);
};

module.exports = { sendEmail };
