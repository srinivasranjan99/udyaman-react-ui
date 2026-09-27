import React from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableHead, 
  TableRow, Button, Divider, Paper 
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext.jsx';
// import api from '../api/axios'; // Use this when connecting the PDF download to the real API

export default function InvoicePreview({ invoiceData, onClose }) {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // In a real implementation:
      // const response = await api.get(`/invoices/${invoiceData.id}/pdf`, { responseType: 'blob' });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `Invoice-${invoiceData.id}.pdf`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      alert("Simulating API PDF Download... (Hook this up to your API endpoint)");
    } catch (error) {
      console.error('Error downloading PDF', error);
      alert('Failed to download PDF.');
    }
  };

  if (!invoiceData) return null;

  return (
    <Box>
      {/* Actions (Hidden during print) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }} className="no-print">
        <Button 
          variant="outlined" 
          startIcon={<PrintIcon />} 
          onClick={handlePrint}
        >
          Print Receipt
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PictureAsPdfIcon />} 
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
        <Button 
          variant="text" 
          color="inherit" 
          startIcon={<CloseIcon />} 
          onClick={onClose}
        >
          Close
        </Button>
      </Box>

      {/* Printable Invoice Area */}
      <Paper 
        className="printable-invoice"
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#fff',
        }}
      >
        {/* Header / Shop Info */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            {user?.tenantId ? user.tenantId.toUpperCase() : 'UDYAMAN ERP RETAIL'}
          </Typography>
          <Typography variant="body1">123 Business Avenue, Tech Park</Typography>
          <Typography variant="body2">GSTIN: 22AAAAA0000A1Z5</Typography>
          <Typography variant="body2">Phone: +91 98765 43210</Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

        {/* Invoice Meta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2"><strong>Invoice No:</strong> {invoiceData.id || `INV-${Date.now().toString().slice(-6)}`}</Typography>
            <Typography variant="body2"><strong>Cashier:</strong> {user?.username || 'Admin'}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2"><strong>Date:</strong> {new Date().toLocaleDateString()}</Typography>
            <Typography variant="body2"><strong>Time:</strong> {new Date().toLocaleTimeString()}</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

        {/* Items Table */}
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #000', px: 0 }}>Item Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #000' }} align="center">Qty</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #000' }} align="right">Rate</TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid #000', px: 0 }} align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items && invoiceData.items.map((item, idx) => {
              const unitPrice = item.unitPrice || 0;
              const quantity = item.quantity || 0;
              const amount = item.totalAmount || (unitPrice * quantity);
              return (
                <TableRow key={idx}>
                  <TableCell sx={{ borderBottom: 'none', px: 0 }}>
                    <Typography variant="body2" fontWeight="medium">{item.productName || `Product ${item.productId}`}</Typography>
                    <Typography variant="caption" color="textSecondary" display="block">GST: {item.gstRate || 0}%</Typography>
                    {item.batches && item.batches.length > 0 && (
                      <Box sx={{ mt: 0.5, pl: 1, borderLeft: '2px solid #eee' }}>
                        {item.batches.map((b, bIdx) => (
                          <Typography key={bIdx} variant="caption" color="text.secondary" display="block">
                            • Batch: {b.batchNumber} ({b.quantity} qty)
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ borderBottom: 'none' }} align="center">{quantity}</TableCell>
                  <TableCell sx={{ borderBottom: 'none' }} align="right">₹{Number(unitPrice).toFixed(2)}</TableCell>
                  <TableCell sx={{ borderBottom: 'none', px: 0 }} align="right">₹{Number(amount).toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Divider sx={{ borderStyle: 'solid', borderColor: '#000', my: 1 }} />

        {/* GST Breakdown & Totals */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 2 }}>
          <Box sx={{ width: '50%', minWidth: '250px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">₹{Number(invoiceData.subtotal || 0).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">CGST:</Typography>
              <Typography variant="body2">₹{Number(invoiceData.totalCgst || 0).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">SGST:</Typography>
              <Typography variant="body2">₹{Number(invoiceData.totalSgst || 0).toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">Grand Total:</Typography>
              <Typography variant="subtitle1" fontWeight="bold">₹{Number(invoiceData.grandTotal || 0).toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', my: 4 }} />

        {/* Footer */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" fontWeight="bold">Thank you for your business!</Typography>
          <Typography variant="caption">Please keep this invoice for future reference. Goods once sold cannot be returned.</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
