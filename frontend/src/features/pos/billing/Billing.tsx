import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    Divider,
    Grid,
    CircularProgress,
    TextField,
    Stack,
    Alert,
    Chip,
    Snackbar
} from '@mui/material';
import {
    ArrowLeft,
    Clock,
    Wallet,
    Banknote,
    CreditCard,
    Smartphone,
    Printer,
    CheckCircle2,
    UserCircle
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ordersAPI, tablesAPI, settingsAPI } from '../../../services/api';

const Billing: React.FC = () => {
    const navigate = useNavigate();
    const { tableId } = useParams<{ tableId: string }>();
    const location = useLocation();
    const tableInfo = location.state?.table;

    const [loading, setLoading] = useState(true);
    const [table, setTable] = useState<any>(tableInfo);
    const [order, setOrder] = useState<any>(null);
    const [paymentModes, setPaymentModes] = useState<any[]>([]);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadData();
    }, [tableId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Get Table Info
            let currentTable = tableInfo;
            if (!currentTable && tableId) {
                const tableRes = await tablesAPI.getById(parseInt(tableId));
                currentTable = tableRes.data;
                setTable(currentTable);
            }

            // 2. Get Active Order for this table
            const ordersRes = await ordersAPI.getAll();
            const allOrders = ordersRes.data || [];
            const activeOrder = allOrders.find((o: any) =>
                o.table_id === parseInt(tableId!) &&
                o.status !== 'Completed' &&
                o.status !== 'Cancelled' &&
                o.status !== 'Paid'
            );

            if (activeOrder) {
                setOrder(activeOrder);
                setPaidAmount(activeOrder.net_amount);
            }

            // 3. Get Payment Modes
            const settingsRes = await settingsAPI.getPaymentModes();
            setPaymentModes(settingsRes.data || []);

        } catch (error) {
            console.error("Error loading billing data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!order) return;

        try {
            setLoading(true);

            // 1. Update Order Status to Paid
            await ordersAPI.update(order.id, {
                status: 'Paid',
                payment_type: selectedPaymentMode,
                paid_amount: paidAmount,
                credit_amount: Math.max(0, order.net_amount - paidAmount)
            });

            // 2. Table status and KOT status are now handled by the backend 
            // when the order status is updated to 'Paid'.

            setSnackbar({ open: true, message: "Payment successful! Order completed and KOTs marked as served.", severity: 'success' });
            setTimeout(() => {
                navigate('/pos');
            }, 1000);
        } catch (error) {
            console.error("Error processing payment:", error);
            setSnackbar({ open: true, message: "Failed to process payment", severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !table) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#FF8C00' }} />
            </Box>
        );
    }

    if (!order && !loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">No active order found for this table.</Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/pos')}>Go Back</Button>
            </Box>
        );
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                    <ArrowLeft size={20} />
                </IconButton>
                <Box>
                    <Typography variant="h5" fontWeight={900} color="#1e293b">Settlement & Billing</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                            {table?.hold_table_name || `TABLE ${table?.table_id}`} • {formatTime(currentTime)}
                        </Typography>
                        {order?.customer && (
                            <>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#94a3b8' }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <UserCircle size={14} color="#FF8C00" />
                                    <Typography variant="caption" sx={{ color: '#FF8C00', fontWeight: 800 }}>
                                        {order.customer.name}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Left: Order Summary */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" fontWeight={800} sx={{ color: '#FF5F00' }}>#{order?.order_number}</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Initialized: {order ? formatDate(order.created_at) : '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label="RUNNING" size="small" sx={{ bgcolor: '#FF5F00', color: 'white', fontWeight: 800, fontSize: '10px' }} />
                                <Chip icon={<Clock size={14} />} label={formatTime(currentTime)} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Items Table */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px', mb: 1, px: 2 }}>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8">ITEM</Typography>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8" align="center">QTY</Typography>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8" align="right">PRICE</Typography>
                                <Typography variant="caption" fontWeight={800} color="#94a3b8" align="right">TOTAL</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {order?.items?.map((item: any) => (
                                    <Box key={item.id} sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 80px 100px 100px',
                                        px: 2,
                                        py: 1.5,
                                        bgcolor: '#f8fafc',
                                        borderRadius: '12px',
                                        alignItems: 'center'
                                    }}>
                                        <Typography variant="body2" fontWeight={700} color="#1e293b">{item.menu_item?.name}</Typography>
                                        <Typography variant="body2" fontWeight={800} align="center" color="#64748b">{item.quantity}</Typography>
                                        <Typography variant="body2" fontWeight={700} align="right" color="#64748b">Rs. {item.price}</Typography>
                                        <Typography variant="body2" fontWeight={800} align="right" color="#1e293b">Rs. {item.subtotal}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: 250 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Gross Amount</Typography>
                                    <Typography variant="body2" fontWeight={800}>Rs. {order?.gross_amount}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Discount</Typography>
                                    <Typography variant="body2" fontWeight={800}>Rs. {order?.discount}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Service Charge (5%)</Typography>
                                    <Typography variant="body2" fontWeight={800}>Rs. {Math.round(order?.net_amount - order?.gross_amount + order?.discount)}</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" fontWeight={900}>Total Payable</Typography>
                                    <Typography variant="h6" fontWeight={900} color="#FF5F00">Rs. {order?.net_amount}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right: Payment */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Wallet size={20} color="#FF5F00" /> Payment Selection
                        </Typography>

                        <Typography variant="body2" fontWeight={700} color="#64748b" sx={{ mb: 2 }}>Select Payment Method</Typography>

                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {/* Standard Options */}
                            <Grid size={6}>
                                <Button
                                    fullWidth
                                    variant={selectedPaymentMode === 'Cash' ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedPaymentMode('Cash')}
                                    startIcon={<Banknote size={18} />}
                                    sx={{
                                        py: 2,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        bgcolor: selectedPaymentMode === 'Cash' ? '#FF5F00' : 'transparent',
                                        borderColor: '#e2e8f0',
                                        color: selectedPaymentMode === 'Cash' ? 'white' : '#64748b',
                                        '&:hover': { bgcolor: selectedPaymentMode === 'Cash' ? '#e65600' : '#f8fafc' }
                                    }}
                                >
                                    Cash
                                </Button>
                            </Grid>

                            {/* Dynamic/Placeholder Options */}
                            {paymentModes.filter(m => m.name !== 'Cash').map((mode) => (
                                <Grid size={6} key={mode.id}>
                                    <Button
                                        fullWidth
                                        variant={selectedPaymentMode === mode.name ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedPaymentMode(mode.name)}
                                        startIcon={mode.name.toLowerCase().includes('card') ? <CreditCard size={18} /> : <Smartphone size={18} />}
                                        sx={{
                                            py: 2,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            bgcolor: selectedPaymentMode === mode.name ? '#FF5F00' : 'transparent',
                                            borderColor: '#e2e8f0',
                                            color: selectedPaymentMode === mode.name ? 'white' : '#64748b',
                                            '&:hover': { bgcolor: selectedPaymentMode === mode.name ? '#e65600' : '#f8fafc' }
                                        }}
                                    >
                                        {mode.name}
                                    </Button>
                                </Grid>
                            ))}

                            {/* Placeholder for future admin added modes */}
                            {paymentModes.length === 0 && (
                                <Grid size={12}>
                                    <Alert severity="info" sx={{ borderRadius: '12px', bgcolor: '#f0f9ff', color: '#0c4a6e', border: '1px solid #bae6fd' }}>
                                        Other payment methods (FonePay, Card, etc.) will appear here once added in Admin Panel.
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>

                        <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '16px', mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" fontWeight={800} color="#64748b">AMOUNT TO PAY</Typography>
                                <Typography variant="h5" fontWeight={900} color="#1e293b">Rs. {order?.net_amount}</Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Received Amount"
                                type="number"
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(Number(e.target.value))}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, fontWeight: 700 }}>Rs.</Typography>,
                                    sx: { borderRadius: '12px', bgcolor: 'white', fontWeight: 900, fontSize: '18px' }
                                }}
                            />

                            {paidAmount > order?.net_amount && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 1 }}>
                                    <Typography variant="body2" fontWeight={700} color="#22c55e">Change to Return</Typography>
                                    <Typography variant="body2" fontWeight={900} color="#22c55e">Rs. {paidAmount - order?.net_amount}</Typography>
                                </Box>
                            )}
                        </Box>

                        <Stack spacing={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleProcessPayment}
                                startIcon={<CheckCircle2 size={22} />}
                                sx={{
                                    py: 2,
                                    borderRadius: '16px',
                                    bgcolor: '#FF5F00',
                                    fontWeight: 900,
                                    fontSize: '18px',
                                    textTransform: 'none',
                                    boxShadow: '0 8px 25px rgba(255,95,0,0.3)',
                                    '&:hover': { bgcolor: '#e65600' }
                                }}
                            >
                                Process Payment & Complete
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Printer size={18} />}
                                sx={{
                                    py: 1.5,
                                    borderRadius: '12px',
                                    borderColor: '#e2e8f0',
                                    color: '#64748b',
                                    fontWeight: 700,
                                    textTransform: 'none'
                                }}
                            >
                                Print Final Bill
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
            {/* Snackbar Notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Billing;
