import React, { useState, useEffect } from 'react';
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
    Chip,
    TextField,
    InputAdornment
} from '@mui/material';
import { Search, Receipt, Download } from 'lucide-react';
import { ordersAPI } from '../../services/api';

const Cashier: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();
            // Filter for completed/pending payment orders
            const cashierOrders = (response.data || []).filter((order: any) =>
                order.status === 'Completed' || order.status === 'Pending'
            );
            setOrders(cashierOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintBill = (_orderId: number) => {
        // TODO: Implement bill printing
        alert('Bill printing functionality will be implemented');
    };

    const filteredOrders = orders.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Cashier</Typography>
                <Typography variant="body2" color="text.secondary">Manage payments and bills</Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
                <TextField
                    size="small"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} color="#64748b" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Order Number</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Table/Customer</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Order Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No orders found for cashier.</TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{order.order_number || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight={700}>
                                                {order.table?.table_id ? `Table ${order.table.table_id}` : (order.customer?.name || 'Walk-in')}
                                            </Typography>
                                            {order.table?.table_id && order.customer?.name && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.customer.name}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{order.order_type || 'N/A'}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>रू {order.net_amount?.toLocaleString() || 0}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status || 'Pending'}
                                            size="small"
                                            sx={{
                                                bgcolor: order.status === 'Completed' ? '#22c55e15' : '#f59e0b15',
                                                color: order.status === 'Completed' ? '#22c55e' : '#f59e0b',
                                                fontWeight: 700
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            startIcon={<Receipt size={14} />}
                                            onClick={() => handlePrintBill(order.id)}
                                            sx={{ color: '#FF8C00', textTransform: 'none', mr: 1 }}
                                        >
                                            Bill
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<Download size={14} />}
                                            sx={{ color: '#64748b', textTransform: 'none' }}
                                        >
                                            PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Cashier;
