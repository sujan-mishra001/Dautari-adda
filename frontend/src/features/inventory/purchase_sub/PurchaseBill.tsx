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
    Chip
} from '@mui/material';
import { Plus, FileText } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { purchaseAPI } from '../../../services/api';

const PurchaseBill: React.FC = () => {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        try {
            setLoading(true);
            const response = await purchaseAPI.getBills();
            setBills(response.data || []);
        } catch (error) {
            console.error('Error loading bills:', error);
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>Purchase Bills</Typography>
                    <Typography variant="body2" color="text.secondary">Manage purchase orders and bills</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                >
                    New Purchase Bill
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Bill Number</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Order Date</TableCell>
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
                        ) : bills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No purchase bills found. Create your first purchase bill to get started.</TableCell>
                            </TableRow>
                        ) : (
                            bills.map((bill) => (
                                <TableRow key={bill.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{bill.bill_number || 'N/A'}</TableCell>
                                    <TableCell>{bill.supplier?.name || 'N/A'}</TableCell>
                                    <TableCell>{new Date(bill.order_date).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>रू {bill.total_amount?.toLocaleString() || 0}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={bill.status || 'Pending'}
                                            size="small"
                                            sx={{
                                                bgcolor: bill.status === 'Received' ? '#22c55e15' : '#f59e0b15',
                                                color: bill.status === 'Received' ? '#22c55e' : '#f59e0b',
                                                fontWeight: 700
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" startIcon={<FileText size={14} />} sx={{ color: '#FF8C00', textTransform: 'none' }}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardLayout>
    );
};

export default PurchaseBill;
