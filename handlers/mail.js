const nodemailer = require('nodemailer');
const path = require('path');
const pug = require('pug');
const juice = require('juice');
const { convert } = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(
    path.join(__dirname, `../views/email/${filename}.pug`),
    options
  );

  // inline html
  const inlined = juice(html);

  return inlined;
};

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = convert(html, {
    wordwrap: 130
  });

  const mailOptions = {
    from: `AJONCODE <ajoncode@gmail.com>`,
    to: options.user.email,
    subject: options.subject,
    html,
    text,
  };

  // since the method is within an object, we need to pass the object as second argument
  const sendMail = promisify(transport.sendMail, transport);


  return sendMail(mailOptions);
};