import { forwardRef } from 'react';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

interface BillViewProps {
    order: any;
}

const BillView = forwardRef<HTMLDivElement, BillViewProps>(({ order }, ref) => {
    if (!order) return null;

    const subtotal = order.gross_amount || 0;
    const discount = order.discount || 0;
    const serviceCharge = Math.round(order.net_amount - subtotal + discount) || 0;
    const total = order.net_amount || 0;

    return (
        <Box
            ref={ref}
            sx={{
                p: 1, // Compact padding
                width: '80mm',
                margin: '0 auto',
                bgcolor: 'white',
                color: 'black',
                fontFamily: 'monospace',
                '@media print': {
                    p: 0,
                    width: '100%',
                }
            }}
        >
            <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 900 }}>DIGIBUSI CAFE</Typography>
                <Typography sx={{ fontSize: '11px' }}>Kathmandu, Nepal</Typography>
                <Typography sx={{ fontSize: '11px' }}>Tel: +977 1-591-2345</Typography>
                <Typography sx={{ fontSize: '11px' }}>PAN No: 123456789</Typography>
            </Box>

            <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />

            <Box sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '11px' }}><strong>Bill No:</strong> {order.order_number}</Typography>
                <Typography sx={{ fontSize: '11px' }}><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</Typography>
                <Typography sx={{ fontSize: '11px' }}><strong>Table:</strong> {order.table?.table_id || 'Walk-in'}</Typography>
                <Typography sx={{ fontSize: '11px' }}><strong>Order Type:</strong> {order.order_type}</Typography>
                {order.customer && <Typography sx={{ fontSize: '11px' }}><strong>Customer:</strong> {order.customer.name}</Typography>}
            </Box>

            <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />

            <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: 'none', p: 0.2, fontSize: '12px', fontFamily: 'monospace' } }}>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Item</strong></TableCell>
                        <TableCell align="center"><strong>Qty</strong></TableCell>
                        <TableCell align="right"><strong>Amt</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {order.items?.map((item: any) => (
                        <TableRow key={item.id}>
                            <TableCell sx={{ maxWidth: '40mm', overflow: 'hidden' }}>{item.menu_item?.name}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">{item.subtotal}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />

            <Box sx={{ px: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '11px' }}>Subtotal:</Typography>
                    <Typography sx={{ fontSize: '11px' }}>{subtotal}</Typography>
                </Box>
                {discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '11px' }}>Discount:</Typography>
                        <Typography sx={{ fontSize: '11px' }}>-{discount}</Typography>
                    </Box>
                )}
                {serviceCharge > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '11px' }}>Service Charge (5%):</Typography>
                        <Typography sx={{ fontSize: '11px' }}>{serviceCharge}</Typography>
                    </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 900 }}>TOTAL:</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 900 }}>Rs. {total}</Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

            <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography sx={{ fontSize: '11px' }}>Thank You for Visiting!</Typography>
                <Typography sx={{ fontSize: '9px' }}>Please visit again</Typography>
            </Box>
        </Box>
    );
});

export default BillView;
