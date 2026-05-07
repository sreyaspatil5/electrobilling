import dayjs from 'dayjs';

export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

export const formatDate = (date) =>
  date ? dayjs(date).format('DD MMM YYYY') : '—';

export const formatDateShort = (date) =>
  date ? dayjs(date).format('DD/MM/YY') : '—';

export const formatInvoiceNumber = (num) => String(num).padStart(4, '0');

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export const calcInvoiceTotals = (items = [], discountPercent = 0, taxType = 'CGST_SGST') => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxableSubtotal = subtotal;
  const totalTaxRate = items.reduce((sum, item) => sum + (item.taxRate || 18), 0) / (items.length || 1);
  const taxTotal = items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.price;
    const rate = item.taxRate !== undefined ? Number(item.taxRate) : 18;
    return sum + (lineTotal * rate) / 100;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal + taxTotal - discountAmount;

  let cgst = 0, sgst = 0, igst = 0;
  if (taxType === 'CGST_SGST') {
    cgst = taxTotal / 2;
    sgst = taxTotal / 2;
  } else {
    igst = taxTotal;
  }

  return {
    subtotal: +subtotal.toFixed(2),
    taxTotal: +taxTotal.toFixed(2),
    discountAmount: +discountAmount.toFixed(2),
    cgst: +cgst.toFixed(2),
    sgst: +sgst.toFixed(2),
    igst: +igst.toFixed(2),
    finalTotal: +finalTotal.toFixed(2),
  };
};

export const PRODUCT_CATEGORIES = ['wire', 'switch', 'bulb', 'socket', 'MCB', 'cable', 'conduit', 'fan', 'panel', 'other'];
export const PRODUCT_UNITS = ['pcs', 'meters', 'kg', 'box', 'roll', 'set', 'pair'];
export const GST_RATES = [0, 5, 12, 18, 28];
