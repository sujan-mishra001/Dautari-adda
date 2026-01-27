import React from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, Avatar } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export const SalesSummary: React.FC<{
    totalSales?: number;
    paidSales?: number;
    creditSales?: number;
    discount?: number;
}> = ({ totalSales = 0, paidSales = 0, creditSales = 0, discount = 0 }) => {
    const paidPercent = totalSales > 0 ? Math.round((paidSales / totalSales) * 100) : 0;
    const creditPercent = totalSales > 0 ? Math.round((creditSales / totalSales) * 100) : 0;

    const options: ApexOptions = {
        chart: { id: 'sales-donut' },
        labels: ['Paid', 'Credit'],
        colors: ['#4caf50', '#ff9800'],
        legend: { show: false },
        dataLabels: { enabled: false },
        stroke: { width: 0 }
    };
    const series = [paidPercent, creditPercent];

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Today's Sales Summary</Typography>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 7 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900}>रू {totalSales.toLocaleString()}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="caption" color="#64748b">Actual sales today</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                        {[
                            { label: 'paid sales', val: `रू ${paidSales.toLocaleString()}`, color: '#4caf50' },
                            { label: 'credit sales', val: `रू ${creditSales.toLocaleString()}`, color: '#ff9800' },
                            { label: 'discount', val: `रू ${discount.toLocaleString()}`, color: '#ef4444' },
                        ].map((item) => (
                            <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                                    <Typography variant="caption" color="#64748b" sx={{ textTransform: 'capitalize' }}>{item.label}</Typography>
                                </Box>
                                <Typography variant="caption" fontWeight={700}>{item.val}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Grid>
                <Grid size={{ xs: 5 }}>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <Chart options={options} series={series.length && series.some(v => v > 0) ? series : [100, 0]} type="donut" width={150} />
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800}>{paidPercent}%</Typography>
                            <Typography variant="caption" color="#94a3b8">Paid</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export const OrderDetail: React.FC<{
    totalOrders?: number;
    dineInCount?: number;
    takeawayCount?: number;
    deliveryCount?: number;
}> = ({ totalOrders = 0, dineInCount = 0, takeawayCount = 0, deliveryCount = 0 }) => (
    <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight={700}>Today's Order Detail</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="#64748b">Actual orders today</Typography>
                </Box>
            </Box>
            <Typography variant="h4" fontWeight={900}>{totalOrders}</Typography>
        </Box>
        <Box sx={{ mt: 3 }}>
            {[
                { label: 'Takeaway', count: takeawayCount, color: '#ff9800', progress: totalOrders > 0 ? (takeawayCount / totalOrders) * 100 : 0 },
                { label: 'Delivery', count: deliveryCount, color: '#ef4444', progress: totalOrders > 0 ? (deliveryCount / totalOrders) * 100 : 0 },
                { label: 'Dine In', count: dineInCount, color: '#4caf50', progress: totalOrders > 0 ? (dineInCount / totalOrders) * 100 : 0 },
            ].map((item) => (
                <Box key={item.label} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                            <Avatar sx={{ width: 22, height: 22, fontSize: 12, bgcolor: '#f1f5f9', color: '#64748b' }}>{item.count}</Avatar>
                        </Box>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: item.color } }}
                    />
                </Box>
            ))}
        </Box>
    </Paper>
);

