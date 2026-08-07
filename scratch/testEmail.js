const nodemailer = require("nodemailer");

async function generateAccount() {
  let testAccount = await nodemailer.createTestAccount();
  console.log("USER:", testAccount.user);
  console.log("PASS:", testAccount.pass);
}

generateAccount();
