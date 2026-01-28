import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Button, Avatar, Chip, LinearProgress } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { TrendingUp, MapPin, AlertCircle } from 'lucide-react';

export const OutstandingRevenue: React.FC<{ amount: number }> = ({ amount }) => {
    // Determine urgency level based on amount
    const urgencyLevel = useMemo(() => {
        if (amount >= 50000) return { level: 'high', color: '#ef4444', label: 'High Priority' };
        if (amount >= 20000) return { level: 'medium', color: '#ff9800', label: 'Medium Priority' };
        if (amount > 0) return { level: 'low', color: '#22c55e', label: 'Low Priority' };
        return { level: 'none', color: '#64748b', label: 'All Clear' };
    }, [amount]);

    const hasOutstanding = amount > 0;

    return (
        <Paper sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            height: '100%',
            border: urgencyLevel.level === 'high' ? '2px solid #fecaca' : '1px solid transparent'
        }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar
                    src="/logo.png"
                    sx={{
                        width: 50,
                        height: 50,
                        bgcolor: `${urgencyLevel.color}20`,
                        border: `2px solid ${urgencyLevel.color}40`
                    }}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={700} color="#64748b">
                                Outstanding Revenue
                            </Typography>
                            <InfoOutlined sx={{ fontSize: 14, color: '#94a3b8' }} />
                        </Box>
                        {hasOutstanding && (
                            <Chip
                                icon={<AlertCircle size={12} />}
                                label={urgencyLevel.label}
                                size="small"
                                sx={{
                                    bgcolor: `${urgencyLevel.color}20`,
                                    color: urgencyLevel.color,
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    height: '20px'
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h5" fontWeight={900} color={urgencyLevel.color}>
                            रू {amount.toLocaleString()}
                        </Typography>
                        {hasOutstanding && (
                            <Typography variant="caption" color="#94a3b8">
                                to collect
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: hasOutstanding ? '#fef3f2' : '#f8fafc', borderRadius: '10px' }}>
                <Typography variant="caption" color="#64748b" sx={{ display: 'block', lineHeight: 1.5 }}>
                    {hasOutstanding ? (
                        <>
                            💡 <strong>Action Required:</strong> This shows the total credit amount from orders that need to be collected.
                            {urgencyLevel.level === 'high' && ' Consider following up with customers for payment.'}
                        </>
                    ) : (
                        <>
                            ✅ <strong>Great!</strong> No pending credit sales. All orders have been fully paid.
                        </>
                    )}
                </Typography>
            </Box>
        </Paper>
    );
};

export const SalesByArea: React.FC<{
    data: Array<{ area: string; amount: number }>;
    paidSales?: number;
    creditSales?: number;
    discount?: number;
}> = ({ data, paidSales = 0, creditSales = 0, discount = 0 }) => {

    // Calculate totals
    const totalFloorSales = useMemo(() => {
        return data.reduce((sum, item) => sum + item.amount, 0);
    }, [data]);

    // Find top performing floor
    const topFloor = useMemo(() => {
        if (data.length === 0) return null;
        return [...data].sort((a, b) => b.amount - a.amount)[0];
    }, [data]);

    // Calculate percentages for each floor
    const floorsWithPercentage = useMemo(() => {
        return data.map(floor => ({
            ...floor,
            percentage: totalFloorSales > 0 ? Math.round((floor.amount / totalFloorSales) * 100) : 0
        }));
    }, [data, totalFloorSales]);

    // Sales breakdown percentages
    const salesBreakdown = useMemo(() => {
        const total = paidSales + creditSales;
        return [
            {
                label: 'Paid Sales',
                amount: paidSales,
                color: '#22c55e',
                percent: total > 0 ? Math.round((paidSales / total) * 100) : 0
            },
            {
                label: 'Discount',
                amount: discount,
                color: '#ef4444',
                percent: total > 0 ? Math.round((discount / total) * 100) : 0
            },
            {
                label: 'Credit',
                amount: creditSales,
                color: '#ff9800',
                percent: total > 0 ? Math.round((creditSales / total) * 100) : 0
            },
        ];
    }, [paidSales, creditSales, discount]);

    // Show message if no floor sales data
    if (data.length === 0) {
        return (
            <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Sales by Floor</Typography>
                <Box sx={{
                    py: 4,
                    textAlign: 'center',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Typography fontSize="3rem">🗺️</Typography>
                    <Typography variant="body2" fontWeight={600}>No Floor Data Available</Typography>
                    <Typography variant="caption" sx={{ maxWidth: 300 }}>
                        Sales will appear here as orders are placed at tables on different floors. Make sure floors and tables are configured.
                    </Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Sales by Floor</Typography>
                    {topFloor && (
                        <Typography variant="caption" color="#64748b" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <TrendingUp size={12} />
                            {topFloor.area} is leading
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {data.slice(0, 3).map(item => (
                        <Button
                            key={item.area}
                            size="small"
                            variant="text"
                            startIcon={<MapPin size={12} />}
                            sx={{
                                color: item === topFloor ? '#FF8C00' : '#64748b',
                                textTransform: 'none',
                                fontWeight: item === topFloor ? 800 : 600,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                px: 1
                            }}
                        >
                            {item.area}
                        </Button>
                    ))}
                </Box>
            </Box>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900}>Rs. {totalFloorSales.toLocaleString()}</Typography>
                            <Typography variant="caption" color="#64748b">Total Floor Sales</Typography>
                            {data.length > 0 && (
                                <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 0.5 }}>
                                    Across {data.length} floor{data.length !== 1 ? 's' : ''}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            {floorsWithPercentage.map((item) => (
                                <Box key={item.area} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MapPin size={12} color="#64748b" />
                                            <Typography variant="caption" color="#64748b" fontWeight={600}>
                                                {item.area}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" fontWeight={700}>
                                            Rs. {item.amount.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(item.percentage, 100)}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: '#f1f5f9',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: item === topFloor ? '#FF8C00' : '#64748b',
                                                borderRadius: 3
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="#94a3b8" fontSize="0.65rem">
                                        {item.percentage}% of floor sales
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} sx={{ borderLeft: { md: '1px solid #e2e8f0' }, pl: { md: 3 } }}>
                    <Typography variant="caption" color="#64748b" fontWeight={700} sx={{ display: 'block', mb: 1.5 }}>
                        Payment Details
                    </Typography>
                    {salesBreakdown.map((item) => (
                        <Box key={item.label} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, mt: 0.5, flexShrink: 0 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="#64748b" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                        {item.label}
                                    </Typography>
                                    {item.percent > 0 && (
                                        <Chip
                                            label={`${item.percent}%`}
                                            size="small"
                                            sx={{
                                                bgcolor: `${item.color}20`,
                                                color: item.color,
                                                fontWeight: 700,
                                                fontSize: '0.6rem',
                                                height: '16px',
                                                minWidth: '30px'
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mt: 0.5 }}>
                                    Rs. {item.amount.toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Grid>
            </Grid>
        </Paper>
    );
};

