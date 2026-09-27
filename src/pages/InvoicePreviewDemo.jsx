/**
 * Invoice Preview Usage Examples & Demo
 * Shows how to integrate and use the InvoicePreview component
 */

import InvoicePreview from '../components/InvoicePreview';
import { sampleInvoice, validateInvoice } from '../utils/invoiceUtils';
import { useState } from 'react';
import {
  Container,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from '@mui/material';

/**
 * Example 1: Simple usage with sample data
 */
export function InvoicePreviewDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Invoice Preview Component Demo
      </Typography>

      <Grid container spacing={3}>
        {/* Example 1: Basic Usage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Example 1: Basic Usage
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                Display sample invoice with all features.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setOpen(true)}
              >
                Preview Sample Invoice
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Example 2: Validation */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Example 2: Invoice Validation
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                Validate invoice before showing preview.
              </Typography>
              <ValidationExample />
            </CardContent>
          </Card>
        </Grid>

        {/* Example 3: Custom Invoice */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Example 3: Custom Invoice
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                Create custom invoice with your data.
              </Typography>
              <CustomInvoiceExample />
            </CardContent>
          </Card>
        </Grid>

        {/* Example 4: API Integration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Example 4: Fetch from API
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                Load invoice from backend API.
              </Typography>
              <APIIntegrationExample />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoice Preview Dialog */}
      <InvoicePreview
        invoice={sampleInvoice}
        open={open}
        onClose={() => setOpen(false)}
      />
    </Container>
  );
}

/**
 * Example: Validation before preview
 */
function ValidationExample() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const handleShowPreview = () => {
    const { isValid, errors } = validateInvoice(sampleInvoice);

    if (!isValid) {
      setError(errors.join(', '));
      return;
    }

    setError('');
    setOpen(true);
  };

  return (
    <>
      {error && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#ffebee', color: '#c62828', borderRadius: 1 }}>
          <Typography variant="caption">{error}</Typography>
        </Box>
      )}
      <Button variant="contained" onClick={handleShowPreview} fullWidth>
        Validate & Preview
      </Button>
      <InvoicePreview
        invoice={sampleInvoice}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/**
 * Example: Custom invoice with calculations
 */
function CustomInvoiceExample() {
  const [open, setOpen] = useState(false);

  const customInvoice = {
    ...sampleInvoice,
    invoiceNumber: 'INV-001002',
    items: sampleInvoice.items.slice(0, 2), // Fewer items
    discount: 5000, // Higher discount
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        fullWidth
      >
        Show Custom Invoice
      </Button>
      <InvoicePreview
        invoice={customInvoice}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/**
 * Example: Fetch invoice from API
 */
function APIIntegrationExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');

  const handleFetchInvoice = async () => {
    setLoading(true);
    setError('');

    try {
      // Example API call
      // const response = await api.get('/invoices/1001');
      // setInvoice(response.data.data);

      // For demo, using sample data
      setInvoice(sampleInvoice);
      setOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#ffebee', color: '#c62828', borderRadius: 1 }}>
          <Typography variant="caption">{error}</Typography>
        </Box>
      )}
      <Button
        variant="contained"
        onClick={handleFetchInvoice}
        disabled={loading}
        fullWidth
      >
        {loading ? 'Loading...' : 'Fetch from API'}
      </Button>
      {invoice && (
        <InvoicePreview
          invoice={invoice}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Code snippets for documentation
 */
export const codeSnippets = {
  basicUsage: `
import InvoicePreview from './components/InvoicePreview';
import { sampleInvoice } from './utils/invoiceUtils';
import { useState } from 'react';

export function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Preview Invoice
      </button>

      <InvoicePreview
        invoice={sampleInvoice}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
  `,

  withValidation: `
import { validateInvoice } from './utils/invoiceUtils';

const handlePreview = () => {
  const { isValid, errors } = validateInvoice(invoice);

  if (!isValid) {
    console.error('Invoice errors:', errors);
    return;
  }

  setOpen(true);
};
  `,

  withCalculations: `
import { calculateInvoiceTotals, calculateGSTBreakdown } from './utils/invoiceUtils';

// Calculate invoice totals
const totals = calculateInvoiceTotals(invoice);
console.log('Total amount:', totals.total);

// Calculate GST breakdown
const gstBreakdown = calculateGSTBreakdown(subtotal, 18, false);
console.log('SGST:', gstBreakdown.sgst);
console.log('CGST:', gstBreakdown.cgst);
  `,

  apiIntegration: `
import api from './api/axios';

// Fetch invoice from backend
const fetchInvoice = async (invoiceId) => {
  try {
    const response = await api.get(\`/invoices/\${invoiceId}\`);
    setInvoice(response.data.data);
    setOpen(true);
  } catch (error) {
    console.error('Error fetching invoice:', error);
  }
};

// PDF Download is handled automatically in component
// Component calls: api.post('/invoices/{id}/download-pdf', ...)
  `,

  invoiceStructure: `
{
  // Basic info
  id: 1,
  invoiceNumber: 'INV-001001',
  invoiceDate: '2026-05-01',
  dueDate: '2026-05-31',
  orderNumber: 'ORD-2026-001',

  // Shop/Vendor info
  shopName: 'Company Name',
  shopAddress: 'Street Address',
  shopCity: 'City',
  shopState: 'State',
  shopPincode: '560001',
  shopPhone: '+91-XXXXX',
  shopEmail: 'email@company.com',
  shopGST: 'GST Number',

  // Customer/Bill To info
  customerName: 'Customer Name',
  customerAddress: 'Customer Address',
  customerCity: 'City',
  customerState: 'State',
  customerPincode: '500001',
  customerGST: 'Customer GST',

  // Line items
  items: [
    {
      description: 'Product/Service',
      productName: 'Name',
      sku: 'SKU-001',
      hsnCode: '9989', // or sacCode for services
      quantity: 5,
      unitPrice: 1000,
    },
  ],

  // Tax & totals
  gstPercentage: 18,
  gstBreakdown: {
    sgst: 900,
    cgst: 900,
    igst: 0,
    sgstRate: 9,
    cgstRate: 9,
    igstRate: 0,
  },
  discount: 500,
  shipping: 100,

  // Optional
  notes: 'Terms and notes',
  terms: 'Terms & conditions',
}
  `,
};

export default InvoicePreviewDemo;

