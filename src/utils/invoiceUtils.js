/**
 * Invoice utility functions
 * Calculations and formatting for invoices
 */

/**
 * Calculate GST breakdown (SGST, CGST, IGST)
 * SGST + CGST = 18% (same state)
 * IGST = 18% (interstate)
 */
export const calculateGSTBreakdown = (
  subtotal,
  gstPercentage = 18,
  isInterstate = false
) => {
  const totalGST = subtotal * (gstPercentage / 100);

  if (isInterstate) {
    return {
      sgst: 0,
      cgst: 0,
      igst: totalGST,
      sgstRate: 0,
      cgstRate: 0,
      igstRate: gstPercentage,
    };
  }

  const halfGST = gstPercentage / 2;
  return {
    sgst: subtotal * (halfGST / 100),
    cgst: subtotal * (halfGST / 100),
    igst: 0,
    sgstRate: halfGST,
    cgstRate: halfGST,
    igstRate: 0,
  };
};

/**
 * Calculate invoice totals
 */
export const calculateInvoiceTotals = (invoice) => {
  if (!invoice?.items?.length) {
    return {
      subtotal: 0,
      gst: 0,
      discount: invoice?.discount || 0,
      shipping: invoice?.shipping || 0,
      total: 0,
    };
  }

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice),
    0
  );

  const gstAmount = invoice.gstBreakdown
    ? (invoice.gstBreakdown.sgst || 0) +
      (invoice.gstBreakdown.cgst || 0) +
      (invoice.gstBreakdown.igst || 0)
    : subtotal * ((invoice.gstPercentage || 0) / 100);

  const discount = invoice.discount || 0;
  const shipping = invoice.shipping || 0;

  const total = subtotal + gstAmount - discount + shipping;

  return {
    subtotal,
    gst: gstAmount,
    discount,
    shipping,
    total: Math.max(0, total),
  };
};

/**
 * Format currency to INR
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Generate invoice number with prefix
 */
export const generateInvoiceNumber = (prefix = 'INV', sequential = 1000) => {
  return `${prefix}-${String(sequential).padStart(6, '0')}`;
};

/**
 * Convert invoice to printable format
 */
export const getInvoicePrintData = (invoice) => {
  const totals = calculateInvoiceTotals(invoice);

  return {
    ...invoice,
    ...totals,
    formattedTotal: formatCurrency(totals.total),
    formattedSubtotal: formatCurrency(totals.subtotal),
    formattedGST: formatCurrency(totals.gst),
    formattedDiscount: formatCurrency(totals.discount),
    formattedShipping: formatCurrency(totals.shipping),
    formattedDate: formatDate(invoice.invoiceDate),
    formattedDueDate: formatDate(invoice.dueDate),
    items: invoice.items?.map(item => ({
      ...item,
      amount: item.quantity * item.unitPrice,
      formattedAmount: formatCurrency(item.quantity * item.unitPrice),
      formattedUnitPrice: formatCurrency(item.unitPrice),
    })) || [],
  };
};

/**
 * Sample invoice data structure
 */
export const sampleInvoice = {
  id: 1,
  invoiceNumber: 'INV-001001',
  invoiceDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  orderNumber: 'ORD-2026-001',

  // Shop info
  shopName: 'Udyaman Retail Solutions',
  shopAddress: '123 Business Park, Tech Street',
  shopCity: 'Bangalore',
  shopState: 'Karnataka',
  shopPincode: '560001',
  shopPhone: '+91-80-1234-5678',
  shopEmail: 'billing@udyaman.com',
  shopGST: '29AAXXX9876H1Z0',

  // Customer info
  customerName: 'ABC Corporation',
  customerAddress: '456 Enterprise Plaza, Commerce Avenue',
  customerCity: 'Hyderabad',
  customerState: 'Telangana',
  customerPincode: '500072',
  customerGST: '36AAACX7896H2Z5',

  // Items
  items: [
    {
      description: 'Premium Software License (Annual)',
      productName: 'Enterprise Suite',
      sku: 'PROD-001',
      hsnCode: '9911',
      quantity: 5,
      unitPrice: 10000,
    },
    {
      description: 'Implementation & Training Services',
      productName: 'Setup & Onboarding',
      sku: 'SVC-001',
      sacCode: '9989',
      quantity: 1,
      unitPrice: 50000,
    },
    {
      description: 'Monthly Support & Maintenance',
      productName: 'Premium Support',
      sku: 'SVC-002',
      sacCode: '9989',
      quantity: 12,
      unitPrice: 5000,
    },
  ],

  // Tax & totals
  gstPercentage: 18,
  gstBreakdown: {
    sgst: 5400,
    cgst: 5400,
    igst: 0,
    sgstRate: 9,
    cgstRate: 9,
    igstRate: 0,
  },
  discount: 2000,
  shipping: 1000,

  // Additional info
  notes: 'Payment terms: Net 30 days. Please make payment by the due date. Thank you for your business!',
  terms: 'Goods once sold are not returnable. GST will be charged as per applicable law. All prices are in INR.',
};

/**
 * Validate invoice data
 */
export const validateInvoice = (invoice) => {
  const errors = [];

  if (!invoice.invoiceNumber) errors.push('Invoice number is required');
  if (!invoice.invoiceDate) errors.push('Invoice date is required');
  if (!invoice.customerName) errors.push('Customer name is required');
  if (!invoice.items?.length) errors.push('Invoice must have at least one item');
  if (!invoice.shopName) errors.push('Shop name is required');

  invoice.items?.forEach((item, idx) => {
    if (!item.description && !item.productName) {
      errors.push(`Item ${idx + 1}: Description is required`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${idx + 1}: Quantity must be greater than 0`);
    }
    if (!item.unitPrice || item.unitPrice < 0) {
      errors.push(`Item ${idx + 1}: Unit price is required and must be non-negative`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  calculateGSTBreakdown,
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  generateInvoiceNumber,
  getInvoicePrintData,
  sampleInvoice,
  validateInvoice,
};

