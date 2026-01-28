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
    Button,
    Avatar,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { Clock, Play, Square } from 'lucide-react';
import { sessionsAPI, authAPI } from '../../services/api';

interface Session {
    id: number;
    user_id: number;
    start_time: string;
    end_time: string | null;
    status: string;
    opening_balance: number;
    closing_balance: number;
    total_sales: number;
    total_orders: number;
    user?: {
        full_name: string;
        role: string;
    };
}

const Sessions: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [sessionsRes, userRes] = await Promise.all([
                sessionsAPI.getAll(),
                authAPI.getCurrentUser()
            ]);

            const sessionData = sessionsRes.data || [];
            // Sort by start_time decending
            sessionData.sort((a: Session, b: Session) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

            setSessions(sessionData);
            setCurrentUser(userRes.data);

            // Check if current user has an active session
            const userActiveSession = sessionData.find((s: Session) => s.user_id === userRes.data.id && !s.end_time);
            if (userActiveSession) {
                setActiveSessionId(userActiveSession.id);
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
            setSnackbar({ open: true, message: 'Failed to load sessions', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = async () => {
        try {
            // Need to prompt for opening balance in a real app, defaulting to 0 for now
            const payload = {
                opening_balance: 0,
                notes: 'Session started via POS'
            };
            const response = await sessionsAPI.create(payload);
            setActiveSessionId(response.data.id);
            setSnackbar({ open: true, message: 'Session started successfully', severity: 'success' });
            loadData();
        } catch (error: any) {
            console.error('Error starting session:', error);
            setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to start session', severity: 'error' });
        }
    };

    const handleEndSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to end this session?')) return;

        try {
            // Should prompt for closing balance/cash counting
            const payload = {
                closing_balance: 0, // This would ideally come from user input
                status: 'Closed'
            };
            await sessionsAPI.update(sessionId, payload);
            if (sessionId === activeSessionId) setActiveSessionId(null);
            setSnackbar({ open: true, message: 'Session ended successfully', severity: 'success' });
            loadData();
        } catch (error: any) {
            console.error('Error ending session:', error);
            setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to end session', severity: 'error' });
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getDuration = (start: string, end: string | null) => {
        if (!end) return 'Ongoing';
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>Staff Sessions</Typography>
                    <Typography variant="body2" color="text.secondary">Monitor active and past worker sessions</Typography>
                </Box>
                {!activeSessionId && (
                    <Button
                        variant="contained"
                        startIcon={<Play size={18} />}
                        onClick={handleStartSession}
                        sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                    >
                        Start My Session
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Staff Member</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Orders</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Sales</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} sx={{ color: '#FF8C00' }} /></TableCell></TableRow>
                        ) : sessions.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No sessions found</TableCell></TableRow>
                        ) : (
                            sessions.map((session) => (
                                <TableRow key={session.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#fff7ed', color: '#FF8C00', fontSize: '14px', fontWeight: 700 }}>
                                                {session.user?.full_name?.charAt(0) || 'U'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>{session.user?.full_name || 'Unknown'}</Typography>
                                                <Typography variant="caption" color="text.secondary">{session.user?.role || 'Staff'}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Clock size={14} color="#64748b" />
                                                <Typography variant="body2" fontWeight={600}>{formatTime(session.start_time)}</Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {getDuration(session.start_time, session.end_time)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={!session.end_time ? 'Active' : 'Closed'}
                                            size="small"
                                            sx={{
                                                bgcolor: !session.end_time ? '#22c55e15' : '#64748b15',
                                                color: !session.end_time ? '#22c55e' : '#64748b',
                                                fontWeight: 700
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>{session.total_orders || 0}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={700}>रू {(session.total_sales || 0).toLocaleString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {!session.end_time && session.user_id === currentUser?.id ? (
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<Square size={14} />}
                                                onClick={() => handleEndSession(session.id)}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                End Session
                                            </Button>
                                        ) : (
                                            <Button
                                                size="small"
                                                sx={{ textTransform: 'none', color: '#64748b' }}
                                            >
                                                View Logs
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Sessions;
