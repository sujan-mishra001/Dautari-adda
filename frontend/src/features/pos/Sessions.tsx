import React from 'react';
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
    Avatar
} from '@mui/material';
import { Clock, Play, Square } from 'lucide-react';

const DUMMY_SESSIONS = [
    { id: 1, staff: 'Sujan Khatri', role: 'Admin', startTime: '09:00 AM', status: 'Active', orders: 15, sales: 8500 },
    { id: 2, staff: 'Maya Sharma', role: 'Staff', startTime: '10:30 AM', status: 'Active', orders: 8, sales: 4200 },
    { id: 3, staff: 'Anish Giri', role: 'Staff', startTime: '08:00 AM', status: 'Closed', endTime: '04:00 PM', orders: 24, sales: 12100 },
];

const Sessions: React.FC = () => {
    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>Staff Sessions</Typography>
                    <Typography variant="body2" color="text.secondary">Monitor active and past worker sessions</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Play size={18} />}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                >
                    Start My Session
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Staff Member</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Start Time</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Orders</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Sales</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {DUMMY_SESSIONS.map((session) => (
                            <TableRow key={session.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: '#fff7ed', color: '#FF8C00', fontSize: '14px', fontWeight: 700 }}>
                                            {session.staff.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{session.staff}</Typography>
                                            <Typography variant="caption" color="text.secondary">{session.role}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Clock size={16} color="#64748b" />
                                        <Typography variant="body2">{session.startTime}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={session.status}
                                        size="small"
                                        sx={{
                                            bgcolor: session.status === 'Active' ? '#22c55e15' : '#64748b15',
                                            color: session.status === 'Active' ? '#22c55e' : '#64748b',
                                            fontWeight: 700
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={600}>{session.orders}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={700}>रू {session.sales.toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {session.status === 'Active' ? (
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<Square size={14} />}
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
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Sessions;
