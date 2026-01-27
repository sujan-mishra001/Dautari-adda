import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Stack,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Snackbar,
    Alert,
    Divider,
    Chip,
    Tooltip
} from '@mui/material';
import { Eye, Printer, X, Trash2, RotateCcw, Download } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useReactToPrint } from 'react-to-print';
import BillView from '../pos/billing/BillView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TABS = ['Table', 'Self Delivery', 'Delivery Partner', 'Takeaway', 'Pay First'];

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    order_type: string;
    status: string;
    customer?: { name: string; phone?: string };
    table?: { table_id: string };
    payment_type?: string;
    gross_amount: number;
    discount: number;
    net_amount: number;
    paid_amount: number;
    credit_amount: number;
    items?: any[];
}

const Orders: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Table');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [billDialogOpen, setBillDialogOpen] = useState(false);
    const billRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: billRef,
        documentTitle: `Bill_${selectedOrder?.order_number}`,
        onPrintError: () => alert("Printer not found or error occurred while printing.")
    });

    const handleDownloadPDF = async () => {
        if (!billRef.current) return;
        try {
            const canvas = await html2canvas(billRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ unit: 'mm', format: [80, 200] });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Bill_${selectedOrder?.order_number}.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
        }
    };

    const handlePrintClick = async (order: Order) => {
        try {
            const response = await ordersAPI.getById(order.id);
            setSelectedOrder(response.data || response);
            setBillDialogOpen(true);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to load order for printing', severity: 'error' });
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();
            let allOrders = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || []);
            allOrders = allOrders.filter((order: Order) => order.order_type === activeTab);
            allOrders.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setOrders(allOrders);
        } catch (error: any) {
            console.error('Error loading orders:', error);
            setOrders([]);
            setSnackbar({ open: true, message: 'Failed to load orders', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const handleView = async (order: Order) => {
        try {
            const response = await ordersAPI.getById(order.id);
            setSelectedOrder(response.data || response);
            setViewDialogOpen(true);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to load order details', severity: 'error' });
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        setProcessing(true);
        try {
            await ordersAPI.update(orderId, { status: 'Cancelled' });
            setSnackbar({ open: true, message: 'Order cancelled successfully', severity: 'success' });
            fetchOrders();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to cancel order', severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this order record? This cannot be undone.')) return;

        setProcessing(true);
        try {
            await ordersAPI.delete(orderId);
            setSnackbar({ open: true, message: 'Order deleted successfully', severity: 'success' });
            fetchOrders();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to delete order', severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return '#10b981';
            case 'Cancelled': return '#ef4444';
            case 'Pending': return '#f59e0b';
            case 'Refunded': return '#6366f1';
            default: return '#64748b';
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>Orders Management</Typography>
                <Button
                    variant="outlined"
                    startIcon={<RotateCcw size={18} />}
                    onClick={fetchOrders}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Paper elevation={0} sx={{ p: 0.5, display: 'flex', gap: 1, bgcolor: '#f1f5f9', borderRadius: '50px', width: 'fit-content', mx: 'auto', border: '1px solid #e2e8f0' }}>
                    {TABS.map(tab => (
                        <Button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                borderRadius: '40px', px: 3, py: 1, textTransform: 'none', fontWeight: 700,
                                bgcolor: activeTab === tab ? '#FF8C00' : 'transparent',
                                color: activeTab === tab ? 'white' : '#64748b',
                                '&:hover': { bgcolor: activeTab === tab ? '#FF7700' : '#e2e8f0' },
                                transition: 'all 0.2s',
                                fontSize: '0.85rem'
                            }}
                        >
                            {tab}
                        </Button>
                    ))}
                </Paper>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, py: 2 }}>ORDER NO.</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>DATE</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>STATUS</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>CUSTOMER</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">NET AMOUNT</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="center">ACTION</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><Typography variant="body2" color="text.secondary">No {activeTab} orders found</Typography></TableCell></TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} hover sx={{ '&:hover': { bgcolor: '#fdfdfd' } }}>
                                    <TableCell sx={{ fontWeight: 700 }}>{order.order_number}</TableCell>
                                    <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{formatDate(order.created_at)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            size="small"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '0.7rem',
                                                bgcolor: `${getStatusColor(order.status)}15`,
                                                color: getStatusColor(order.status),
                                                border: `1px solid ${getStatusColor(order.status)}30`
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{order.customer?.name || '-'}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#1e293b' }}>रू {order.net_amount?.toLocaleString()}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title="View Details">
                                                <IconButton size="small" sx={{ color: '#FF8C00' }} onClick={() => handleView(order)}><Eye size={16} /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Print Bill">
                                                <IconButton
                                                    size="small"
                                                    sx={{ color: '#64748b' }}
                                                    onClick={() => handlePrintClick(order)}
                                                >
                                                    <Printer size={16} />
                                                </IconButton>
                                            </Tooltip>
                                            {order.status !== 'Cancelled' && (
                                                <Tooltip title="Cancel Order">
                                                    <IconButton size="small" color="warning" onClick={() => handleCancelOrder(order.id)} disabled={processing}><X size={16} /></IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Delete Permanently">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteOrder(order.id)} disabled={processing}><Trash2 size={16} /></IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                    <Typography fontWeight={800}>Order Summary - {selectedOrder?.order_number}</Typography>
                    <IconButton onClick={() => setViewDialogOpen(false)} size="small"><X size={20} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedOrder && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Order Type</Typography>
                                    <Typography variant="body2" fontWeight={700}>{selectedOrder.order_type}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getStatusColor(selectedOrder.status) }} />
                                        <Typography variant="body2" fontWeight={700}>{selectedOrder.status}</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Table</Typography>
                                    <Typography variant="body2" fontWeight={700}>{selectedOrder.table?.table_id || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Customer</Typography>
                                    <Typography variant="body2" fontWeight={700}>{selectedOrder.customer?.name || 'Walk-in'}</Typography>
                                </Box>
                            </Box>

                            <Divider />

                            <Typography variant="subtitle2" fontWeight={800} color="#FF8C00">Bill Items</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>ITEM</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">QTY</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">AMOUNT</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedOrder.items?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell sx={{ fontSize: '0.8rem' }}>{item.menu_item?.name}</TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem' }} align="center">{item.quantity}</TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }} align="right">Rs. {item.subtotal?.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Box sx={{ mt: 1, bgcolor: '#f8fafc', p: 2, borderRadius: '12px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                    <Typography variant="body2" fontWeight={600}>Rs. {selectedOrder.gross_amount?.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">Discount</Typography>
                                    <Typography variant="body2" color="error.main" fontWeight={600}>- Rs. {selectedOrder.discount?.toLocaleString()}</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle1" fontWeight={800}>Total Payable</Typography>
                                    <Typography variant="subtitle1" fontWeight={900} color="#FF8C00">Rs. {selectedOrder.net_amount?.toLocaleString()}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    <Button
                        variant="outlined"
                        startIcon={<Printer size={18} />}
                        onClick={() => {
                            setViewDialogOpen(false);
                            setBillDialogOpen(true);
                        }}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Print Invoice
                    </Button>
                    <Button variant="contained" onClick={() => setViewDialogOpen(false)} sx={{ bgcolor: '#FF8C00', borderRadius: '10px', textTransform: 'none', px: 4 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Bill Preview Dialog */}
            <Dialog
                open={billDialogOpen}
                onClose={() => setBillDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px' } }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" fontWeight={800}>Bill Preview</Typography>
                    <IconButton onClick={() => setBillDialogOpen(false)} size="small"><X size={20} /></IconButton>
                </Box>
                <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                    <Box sx={{ p: 2 }}>
                        <Paper elevation={0} sx={{ p: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <BillView
                                ref={billRef}
                                order={selectedOrder}
                            />
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Download size={18} />}
                        onClick={handleDownloadPDF}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                    >
                        Save as PDF
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Printer size={18} />}
                        onClick={() => handlePrint()}
                        sx={{ borderRadius: '10px', bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', fontWeight: 700 }}
                    >
                        Print Bill
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Orders;
