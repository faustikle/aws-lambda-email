const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

exports.handler = async (event) => {
  const ses = new AWS.SES({apiVersion: '2010-12-01'});
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  
  const envioEmails = event.Records.map(async emailRecord => {
    const { receiptHandle, body, messageAttributes } = emailRecord;
    const { Template, EmailDestino } = messageAttributes;

    const emailParams = {
      Destination: {
        ToAddresses: [ EmailDestino.stringValue ]
      },
      Template: Template.stringValue,
      TemplateData: body,
      Source: process.env.EMAIL_SOURCE,
    };
    
    await ses.sendTemplatedEmail(emailParams).promise();
    await sqs.deleteMessage({ QueueUrl: process.env.FILA, ReceiptHandle: receiptHandle }).promise();
  });

  return await Promise.all(envioEmails);
};
