import React from 'react';
import { Box, Typography, Paper, Grid, Button, Avatar } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

export const OutstandingRevenue: React.FC<{ amount: number }> = ({ amount }) => (
    <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar src="/logo.png" sx={{ width: 50, height: 50, bgcolor: 'rgba(255, 140, 0, 0.1)' }} />
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#64748b">Outstanding Revenue</Typography>
                    <InfoOutlined sx={{ fontSize: 14, color: '#94a3b8' }} />
                </Box>
                <Typography variant="h5" fontWeight={900}>रू {amount.toLocaleString()}</Typography>
            </Box>
        </Box>
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '10px' }}>
            <Typography variant="caption" color="#64748b">
                This shows the total amount from all credit orders that are yet to be settled.
            </Typography>
        </Box>
    </Paper>
);

export const SalesByArea: React.FC<{ data: Array<{ area: string; amount: number }> }> = ({ data }) => {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700}>Sales by Area</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {data.map(item => (
                        <Button key={item.area} size="small" variant="text" sx={{ color: '#64748b', textTransform: 'none', fontWeight: 700 }}>{item.area}</Button>
                    ))}
                </Box>
            </Box>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900}>Rs. {totalAmount.toLocaleString()}</Typography>
                            <Typography variant="caption" color="#64748b">Total Floor Sales</Typography>
                        </Box>
                        <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                            {data.map((item) => (
                                <Grid size={{ xs: 6 }} key={item.area}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="#64748b">{item.area}</Typography>
                                        <Typography variant="caption" fontWeight={700}>Rs. {item.amount.toLocaleString()}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} sx={{ borderLeft: { md: '1px solid #eee' }, pl: { md: 3 } }}>
                    {[
                        { label: 'Paid Sales', amount: totalAmount, color: '#4caf50' },
                        { label: 'Discount', amount: '0', color: '#ef4444' },
                        { label: 'Credit', amount: '0', color: '#ff9800' },
                    ].map((item) => (
                        <Box key={item.label} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                            <Box>
                                <Typography variant="caption" color="#64748b" sx={{ display: 'block' }}>{item.label}</Typography>
                                <Typography variant="caption" fontWeight={700}>Rs. {item.amount.toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Grid>
            </Grid>
        </Paper>
    );
};
