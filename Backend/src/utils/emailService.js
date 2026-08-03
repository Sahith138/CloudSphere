const nodemailer = require("nodemailer");

const sendInviteEmail = async (email, groupName, inviterName) => {
  try {
    // If credentials aren't provided yet, just log and return
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.log(`[Email Mock] Would have sent invite email to ${email} for group ${groupName}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"CloudSphere" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `You're invited to join ${groupName} on CloudSphere!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e40af;">You've been invited!</h2>
          <p style="color: #334155; font-size: 16px;">
            Hi there,
          </p>
          <p style="color: #334155; font-size: 16px;">
            <strong>${inviterName}</strong> has invited you to join the group <strong>"${groupName}"</strong> on CloudSphere!
          </p>
          <p style="color: #334155; font-size: 16px;">
            CloudSphere is a premium cloud storage platform. To accept the invitation and access the group's files, simply create a free account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/register" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Join CloudSphere
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendInviteEmail,
};
