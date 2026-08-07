const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Use hardcoded ethereal account
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: 'zt2fzdompdp7bajx@ethereal.email',
      pass: 'AFFt6hdYVzSs2WPnum'
    },
  });

  const mailOptions = {
    from: "CloudSphere Support <support@cloudsphere.com>",
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
