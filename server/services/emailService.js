const nodemailer = require('nodemailer');
const axios = require('axios');
const logger = require('../config/logger');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Send invoice email with PDF attachment fetched from S3 URL.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.customerName
 * @param {string} options.invoiceNumber
 * @param {string} options.invoiceUrl - S3 URL of the PDF
 * @param {string} options.businessName
 * @param {number} options.amount - Final total
 */
const sendInvoiceEmail = async ({ to, customerName, invoiceNumber, invoiceUrl, businessName, amount }) => {
  try {
    // Fetch PDF buffer from S3 URL
    const response = await axios.get(invoiceUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data);

    const transporter = createTransporter();

    const mailOptions = {
      from: `"${businessName}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Invoice ${invoiceNumber} from ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1565c0;">Invoice ${invoiceNumber}</h2>
          <p>Dear ${customerName},</p>
          <p>Please find your invoice <strong>${invoiceNumber}</strong> attached to this email.</p>
          <div style="background: #f8fbff; border-left: 4px solid #1565c0; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <strong>Invoice Amount: ₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <p>You can also <a href="${invoiceUrl}" style="color:#1565c0">view and download your invoice here</a>.</p>
          <p style="margin-top: 32px; color: #777;">Thank you for your business!</p>
          <p><strong>${businessName}</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Invoice email sent to ${to}, messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Email send failed to ${to}:`, err);
    throw new Error(`Email send failed: ${err.message}`);
  }
};

module.exports = { sendInvoiceEmail };
