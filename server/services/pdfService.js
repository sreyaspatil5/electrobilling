const puppeteer = require('puppeteer');
const logger = require('../config/logger');

/**
 * Generates a professional invoice PDF using Puppeteer.
 * @param {Object} invoiceData - Full invoice data (business, customer, items, totals)
 * @returns {Buffer} - PDF buffer ready for S3 upload
 */
const generateInvoicePDF = async (invoiceData) => {
  const { business, invoice } = invoiceData;
  const html = buildInvoiceHTML(business, invoice);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    // Use networkidle2 and a timeout to prevent hanging if external images fail to load
    await page.setContent(html, { waitUntil: 'networkidle2', timeout: 15000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    logger.info(`PDF generated for invoice: ${invoice.invoiceNumber}`);
    return Buffer.from(pdfBuffer);
  } catch (err) {
    logger.error('PDF generation failed:', err);
    throw new Error(`PDF generation failed: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

const buildInvoiceHTML = (business, invoice) => {
  const itemRows = invoice.items
    .map(
      (item, i) => `
      <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td>${i + 1}</td>
        <td>
          <strong>${item.name}</strong>
          ${item.hsn ? `<br><span class="hsn">HSN: ${item.hsn}</span>` : ''}
        </td>
        <td class="center">${item.quantity}</td>
        <td class="right">${formatCurrency(item.price)}</td>
        <td class="center">${item.taxRate}%</td>
        <td class="right">${formatCurrency(item.taxAmount)}</td>
        <td class="right"><strong>${formatCurrency(item.total)}</strong></td>
      </tr>`
    )
    .join('');

  const taxSection =
    invoice.taxType === 'CGST_SGST'
      ? `<tr><td>CGST (${invoice.items[0]?.taxRate / 2 || 9}%)</td><td>${formatCurrency(invoice.cgst)}</td></tr>
         <tr><td>SGST (${invoice.items[0]?.taxRate / 2 || 9}%)</td><td>${formatCurrency(invoice.sgst)}</td></tr>`
      : `<tr><td>IGST (${invoice.items[0]?.taxRate || 18}%)</td><td>${formatCurrency(invoice.igst)}</td></tr>`;

  const invoiceDateStr = new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const dueDateStr = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; }
  .invoice-wrapper { width: 794px; min-height: 1123px; margin: 0 auto; padding: 40px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .logo-block img { width: 120px; height: auto; object-fit: contain; }
  .logo-placeholder { width: 120px; height: 60px; background: #e8f4fd; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; color: #1565c0; }
  .invoice-title-block { text-align: right; }
  .invoice-title { font-size: 32px; font-weight: 800; color: #1565c0; letter-spacing: 2px; text-transform: uppercase; }
  .invoice-number { font-size: 14px; color: #555; margin-top: 4px; }
  .invoice-date { font-size: 12px; color: #777; margin-top: 2px; }

  /* Divider */
  .divider { height: 3px; background: linear-gradient(90deg, #1565c0, #42a5f5); border-radius: 2px; margin: 20px 0; }

  /* Parties */
  .parties { display: flex; justify-content: space-between; margin-bottom: 28px; gap: 20px; }
  .party-card { flex: 1; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0; }
  .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1565c0; margin-bottom: 8px; }
  .party-name { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
  .party-info { font-size: 12px; color: #555; line-height: 1.6; }
  .gst-tag { display: inline-block; background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-top: 6px; }

  /* Invoice meta */
  .meta-bar { display: flex; gap: 12px; margin-bottom: 24px; }
  .meta-chip { background: #f5f5f5; border-radius: 6px; padding: 10px 16px; flex: 1; }
  .meta-chip .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #999; letter-spacing: 0.5px; }
  .meta-chip .value { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-top: 2px; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #1565c0; color: #fff; }
  thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  th.center, td.center { text-align: center; }
  th.right, td.right { text-align: right; }
  .row-even { background: #fff; }
  .row-odd { background: #f8fbff; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #eeeeee; vertical-align: top; }
  .hsn { font-size: 10px; color: #999; }
  tfoot tr { background: #f5f5f5; }
  tfoot td { padding: 8px 12px; font-weight: 600; }

  /* Totals */
  .totals-section { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .totals-table { min-width: 260px; }
  .totals-table table { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
  .totals-table td { padding: 8px 14px; }
  .totals-table tr:last-child td { background: #1565c0; color: #fff; font-size: 15px; font-weight: 800; }
  .totals-table .label-col { color: #555; }

  /* Bank + Notes */
  .bottom-section { display: flex; gap: 20px; margin-bottom: 32px; }
  .bank-card, .notes-card { flex: 1; padding: 14px; border-radius: 8px; border: 1px solid #e0e0e0; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1565c0; margin-bottom: 8px; }
  .bank-card p, .notes-card p { font-size: 12px; color: #555; line-height: 1.8; }

  /* Signature */
  .signature-section { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .signature-block { text-align: center; min-width: 160px; }
  .signature-block img { width: 120px; height: 60px; object-fit: contain; margin-bottom: 4px; }
  .signature-line { border-top: 1px solid #333; padding-top: 6px; font-size: 11px; color: #555; font-weight: 600; }

  /* Footer */
  .footer { text-align: center; font-size: 11px; color: #aaa; padding-top: 16px; border-top: 1px solid #eee; }
  .footer strong { color: #1565c0; }
</style>
</head>
<body>
<div class="invoice-wrapper">

  <!-- Header -->
  <div class="header">
    <div class="logo-block">
      ${business.logoUrl
      ? `<img src="${business.logoUrl}" alt="${business.businessName} Logo"/>`
      : `<div class="logo-placeholder">${(business.businessName || 'B').charAt(0)}</div>`}
      <div style="margin-top:10px">
        <strong style="font-size:16px;color:#1a1a2e">${business.businessName || ''}</strong><br/>
        <span style="font-size:11px;color:#777">${business.address || ''}${business.city ? ', ' + business.city : ''}</span><br/>
        ${business.gstNumber ? `<span style="font-size:11px;color:#777">GSTIN: ${business.gstNumber}</span>` : ''}
      </div>
    </div>
    <div class="invoice-title-block">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-number"># ${invoice.invoiceNumber}</div>
      <div class="invoice-date">Date: ${invoiceDateStr}</div>
      <div class="invoice-date">Due: ${dueDateStr}</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Parties -->
  <div class="parties">
    <div class="party-card">
      <div class="party-label">From (Seller)</div>
      <div class="party-name">${business.businessName || ''}</div>
      <div class="party-info">
        ${business.address || ''}${business.city ? ', ' + business.city : ''}${business.state ? ', ' + business.state : ''}<br/>
        ${business.phone ? `📞 ${business.phone}` : ''}
        ${business.email ? `<br/>✉️ ${business.email}` : ''}
      </div>
      ${business.gstNumber ? `<span class="gst-tag">GSTIN: ${business.gstNumber}</span>` : ''}
    </div>
    <div class="party-card">
      <div class="party-label">Bill To (Customer)</div>
      <div class="party-name">${invoice.customerSnapshot?.name || ''}</div>
      <div class="party-info">
        ${invoice.customerSnapshot?.address || ''}${invoice.customerSnapshot?.city ? ', ' + invoice.customerSnapshot.city : ''}
        ${invoice.customerSnapshot?.state ? '<br/>' + invoice.customerSnapshot.state : ''}<br/>
        ${invoice.customerSnapshot?.phone ? `📞 ${invoice.customerSnapshot.phone}` : ''}
        ${invoice.customerSnapshot?.email ? `<br/>✉️ ${invoice.customerSnapshot.email}` : ''}
      </div>
      ${invoice.customerSnapshot?.gstNumber ? `<span class="gst-tag">GSTIN: ${invoice.customerSnapshot.gstNumber}</span>` : ''}
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Description</th>
        <th class="center" style="width:60px">Qty</th>
        <th class="right" style="width:90px">Rate</th>
        <th class="center" style="width:60px">Tax%</th>
        <th class="right" style="width:80px">Tax Amt</th>
        <th class="right" style="width:100px">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-table">
      <table>
        <tr><td class="label-col">Subtotal</td><td class="right">${formatCurrency(invoice.subtotal)}</td></tr>
        ${taxSection}
        ${invoice.discountAmount > 0 ? `<tr><td class="label-col">Discount</td><td class="right">- ${formatCurrency(invoice.discountAmount)}</td></tr>` : ''}
        <tr><td><strong>Total Amount</strong></td><td class="right"><strong>${formatCurrency(invoice.finalTotal)}</strong></td></tr>
      </table>
    </div>
  </div>

  <!-- Bank + Notes -->
  <div class="bottom-section">
    ${(business.bankName || business.upiId) ? `
    <div class="bank-card">
      <div class="section-title">Payment Details</div>
      <p>
        ${business.bankName ? `Bank: <strong>${business.bankName}</strong><br/>` : ''}
        ${business.accountNumber ? `A/c No: <strong>${business.accountNumber}</strong><br/>` : ''}
        ${business.ifscCode ? `IFSC: <strong>${business.ifscCode}</strong><br/>` : ''}
        ${business.upiId ? `UPI: <strong>${business.upiId}</strong>` : ''}
      </p>
    </div>` : ''}
    ${invoice.notes ? `
    <div class="notes-card">
      <div class="section-title">Notes</div>
      <p>${invoice.notes}</p>
    </div>` : ''}
  </div>

  <!-- Signature -->
  ${business.signatureUrl ? `
  <div class="signature-section">
    <div class="signature-block">
      <img src="${business.signatureUrl}" alt="Signature"/>
      <div class="signature-line">Authorized Signatory<br/>${business.businessName || ''}</div>
    </div>
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    Thank you for your business! &nbsp;|&nbsp; Generated by <strong>ElectroBill</strong>
    <br/>${business.phone ? `📞 ${business.phone}` : ''} ${business.email ? `| ✉️ ${business.email}` : ''}
  </div>

</div>
</body>
</html>`;
};

module.exports = { generateInvoicePDF };
