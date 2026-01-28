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
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import { Eye, Download, Calendar, User, Clock, DollarSign, FileText } from 'lucide-react';
import { reportsAPI } from '../../services/api';

interface Session {
    id: number;
    user_id: number;
    user_name: string;
    start_time: string;
    end_time: string | null;
    status: string;
    opening_balance: number;
    closing_balance: number;
    total_sales: number;
    total_orders: number;
    notes: string | null;
}

const SessionReport: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const response = await reportsAPI.getSessions();
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await reportsAPI.exportSessionsPDF();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'session_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('Failed to export session report');
        }
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const calculateDuration = (start: string, end: string | null) => {
        if (!end) return 'Ongoing';
        try {
            const diff = new Date(end).getTime() - new Date(start).getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        } catch {
            return '-';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress sx={{ color: '#FF8C00' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                        <Calendar size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Session Report
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track all POS sessions, staff activity, and sales performance
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<FileText size={18} />}
                    onClick={handleExportPDF}
                    sx={{
                        bgcolor: '#FF8C00',
                        '&:hover': { bgcolor: '#FF7700' },
                        textTransform: 'none',
                        borderRadius: '10px',
                        fontWeight: 700
                    }}
                >
                    Export PDF
                </Button>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                <Paper sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9' }} elevation={0}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL SESSIONS</Typography>
                    <Typography variant="h4" fontWeight={800} color="#FF8C00">{sessions.length}</Typography>
                </Paper>
                <Paper sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9' }} elevation={0}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>ACTIVE SESSIONS</Typography>
                    <Typography variant="h4" fontWeight={800} color="#10b981">
                        {sessions.filter(s => s.status === 'Active').length}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9' }} elevation={0}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL SALES</Typography>
                    <Typography variant="h4" fontWeight={800}>
                        Rs. {sessions.reduce((sum, s) => sum + (s.total_sales || 0), 0).toLocaleString()}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9' }} elevation={0}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL ORDERS</Typography>
                    <Typography variant="h4" fontWeight={800}>
                        {sessions.reduce((sum, s) => sum + (s.total_orders || 0), 0)}
                    </Typography>
                </Paper>
            </Box>

            {/* Sessions Table */}
            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #f1f5f9' }} elevation={0}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Session ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Staff</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Start Time</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>End Time</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Opening</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Closing</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Sales</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Orders</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No sessions found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : sessions.map((session) => (
                            <TableRow key={session.id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={700}>#{session.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <User size={16} color="#64748b" />
                                        <Typography variant="body2">{session.user_name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontSize="0.8rem">
                                        {formatDateTime(session.start_time)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontSize="0.8rem">
                                        {formatDateTime(session.end_time)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Clock size={14} color="#64748b" />
                                        <Typography variant="body2" fontSize="0.8rem">
                                            {calculateDuration(session.start_time, session.end_time)}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={session.status}
                                        size="small"
                                        sx={{
                                            bgcolor: session.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                                            color: session.status === 'Active' ? '#16a34a' : '#64748b',
                                            fontWeight: 700,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight={600}>
                                        Rs. {session.opening_balance.toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight={600}>
                                        {session.closing_balance > 0 ? `Rs. ${session.closing_balance.toLocaleString()}` : '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <DollarSign size={14} color="#FF8C00" />
                                        <Typography variant="body2" fontWeight={700} color="#FF8C00">
                                            Rs. {session.total_sales.toLocaleString()}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight={600}>
                                        {session.total_orders}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View Details">
                                        <IconButton size="small" sx={{ color: '#64748b' }}>
                                            <Eye size={16} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Export">
                                        <IconButton size="small" sx={{ color: '#64748b' }}>
                                            <Download size={16} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default SessionReport;
