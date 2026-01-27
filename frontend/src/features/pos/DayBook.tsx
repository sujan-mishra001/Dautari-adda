import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Card,
    CardContent,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { Eye, DollarSign } from 'lucide-react';
import { ordersAPI } from '../../services/api';

interface DayBookEntry {
    id: string;
    order_number: string;
    paymentStatus: string;
    received: number;
    paid?: number;
}

const DayBook: React.FC = () => {
    const [viewMode, setViewMode] = useState<'daybook' | 'sales'>('daybook');
    const [tab, setTab] = useState(0);
    const [data, setData] = useState<DayBookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalReceived, setTotalReceived] = useState(0);

    useEffect(() => {
        loadData();
    }, [viewMode]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();
            const orders = response.data || [];

            const entries: DayBookEntry[] = orders
                .filter((order: any) => {
                    if (viewMode === 'daybook') {
                        return order.status === 'Paid' || order.status === 'Completed';
                    } else {
                        return true;
                    }
                })
                .map((order: any) => ({
                    id: order.id.toString(),
                    order_number: order.order_number,
                    paymentStatus: order.status === 'Paid' || order.status === 'Completed' ? 'Fullpaid' : 'Pending',
                    received: order.paid_amount || 0,
                    paid: order.paid_amount || 0
                }))
                .sort((a: DayBookEntry, b: DayBookEntry) =>
                    parseInt(b.order_number.split('-').pop() || '0') - parseInt(a.order_number.split('-').pop() || '0')
                );

            setData(entries);

            const received = entries.reduce((sum, entry) => sum + entry.received, 0);
            setTotalReceived(received);
        } catch (error) {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>Day Book / Sales</Typography>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    sx={{
                        '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            '&.Mui-selected': { bgcolor: '#FF8C00', color: 'white', '&:hover': { bgcolor: '#FF7700' } }
                        }
                    }}
                >
                    <ToggleButton value="daybook">Day Book</ToggleButton>
                    <ToggleButton value="sales">Sales</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 4 }}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: '#22c55e20', borderRadius: '12px' }}><DollarSign color="#22c55e" size={24} /></Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Opening Balance</Typography>
                            <Typography variant="h6" fontWeight={800}>Rs. 8,930</Typography>
                        </Box>
                    </CardContent>
                </Card>
                <Card sx={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: '#22c55e20', borderRadius: '12px' }}><DollarSign color="#22c55e" size={24} /></Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Total {viewMode === 'daybook' ? 'Received' : 'Sales'}</Typography>
                            <Typography variant="h6" fontWeight={800}>Rs. {totalReceived.toLocaleString()}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Paper sx={{ borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Tab label="Day Book" />
                    <Tab label="Sales" />
                    <Tab label="Credit Sales" />
                </Tabs>
                <Box sx={{ p: 3 }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>ORDER ID</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>PAYMENT STATUS</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>RECEIVED</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ACTION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow> :
                                    data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{row.order_number}</TableCell>
                                            <TableCell>
                                                <Chip label={row.paymentStatus} size="small" sx={{ bgcolor: row.paymentStatus === 'Fullpaid' ? '#22c55e20' : '#FF8C0020', color: row.paymentStatus === 'Fullpaid' ? '#22c55e' : '#FF8C00', fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Rs. {row.received.toLocaleString()}</TableCell>
                                            <TableCell><IconButton size="small" sx={{ color: '#FF8C00' }}><Eye size={18} /></IconButton></TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default DayBook;
