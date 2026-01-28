import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import {
    Download,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    FileText,
    BarChart3,
    Calendar
} from 'lucide-react';
import { reportsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const res = await reportsAPI.getDashboardSummary();
                setSummary(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const reportTypes = [
        { name: 'Daily Sales Report', icon: <DollarSign />, description: 'Summary of sales, tax, and discounts for today', type: 'sales' },
        { name: 'Inventory Consumption', icon: <ShoppingCart />, description: 'Track stock usage and low inventory items', type: 'inventory' },
        { name: 'Customer Analytics', icon: <BarChart3 />, description: 'Visit frequency and total spending by customer', type: 'customers' },
        { name: 'Staff Performance', icon: <FileText />, description: 'Orders processed and items served per staff', type: 'staff' },
        { name: 'Session Report', icon: <Calendar />, description: 'View all POS sessions, sales, and staff activity', type: 'sessions', navigateTo: '/reports/sessions' },
    ];

    const handleExport = async (type: string, format: 'pdf' | 'excel') => {
        try {
            // Special handling for sessions PDF export
            if (type === 'sessions' && format === 'pdf') {
                const res = await reportsAPI.exportSessionsPDF();
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'session_report.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
                return;
            }

            const res = format === 'pdf'
                ? await reportsAPI.exportPDF(type, {})
                : await reportsAPI.exportExcel(type, {});

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            alert('Failed to export report');
        }
    };

    if (loading && !summary) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>Business Intelligence & Reports</Typography>
                    <Typography variant="body2" color="text.secondary">Analyze your restaurant performance and export data</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Calendar size={18} />}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    Custom Date Range
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid #f1f5f9' }} elevation={0}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#fff7ed', color: '#FF8C00' }}><TrendingUp size={20} /></Avatar>
                            </Box>
                            <Typography variant="h5" fontWeight={800}>Rs. {summary?.sales_24h?.toLocaleString() || '0'}</Typography>
                            <Typography variant="body2" color="text.secondary">Sales (24 Hours)</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid #f1f5f9' }} elevation={0}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }}><ShoppingCart size={20} /></Avatar>
                            </Box>
                            <Typography variant="h5" fontWeight={800}>{summary?.orders_24h || '0'}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Orders (24h)</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Available Reports</Typography>
            <Grid container spacing={3}>
                {reportTypes.map((report) => (
                    <Grid size={{ xs: 12, md: 6 }} key={report.name}>
                        <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #f1f5f9', '&:hover': { border: '1px solid #FF8C00' } }} elevation={0}>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', color: '#FF8C00' }}>
                                    {report.icon}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                        fontWeight={700}
                                        sx={{
                                            cursor: report.navigateTo ? 'pointer' : 'default',
                                            '&:hover': report.navigateTo ? { color: '#FF8C00' } : {}
                                        }}
                                        onClick={() => report.navigateTo && navigate(report.navigateTo)}
                                    >
                                        {report.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{report.description}</Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            size="small"
                                            startIcon={<Download size={14} />}
                                            sx={{ textTransform: 'none', color: '#64748b' }}
                                            onClick={() => handleExport(report.type, 'pdf')}
                                        >
                                            PDF
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<Download size={14} />}
                                            sx={{ textTransform: 'none', color: '#64748b' }}
                                            onClick={() => handleExport(report.type, 'excel')}
                                        >
                                            Excel
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const Avatar = ({ children, sx }: any) => (
    <Box sx={{ width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
        {children}
    </Box>
);

export default Reports;
