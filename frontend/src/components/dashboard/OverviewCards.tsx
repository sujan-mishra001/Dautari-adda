import React, { useMemo } from 'react';
import { Box, Typography, Paper, Button, Avatar, Chip } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

export const WelcomeCard: React.FC<{
    username: string;
    salesToday: number;
    ordersToday: number;
    onGoToPOS?: () => void;
    isSessionActive: boolean;
    sessionDuration?: string;
    sessionStartDate?: string;
    onStartSession: () => void;
    onEndSession: () => void;
}> = ({
    username,
    salesToday,
    ordersToday,
    onGoToPOS,
    isSessionActive,
    sessionDuration,
    sessionStartDate,
    onStartSession,
    onEndSession
}) => {
        // Dynamic greeting based on time
        const greeting = useMemo(() => {
            const hour = new Date().getHours();
            if (hour < 12) return 'Good Morning';
            if (hour < 17) return 'Good Afternoon';
            return 'Good Evening';
        }, []);

        // Calculate average order value
        const avgOrderValue = useMemo(() => {
            return ordersToday > 0 ? Math.round(salesToday / ordersToday) : 0;
        }, [salesToday, ordersToday]);

        // Check if session is approaching 24 hours (show warning at 20+ hours)
        const sessionWarning = useMemo(() => {
            if (!sessionDuration) return false;
            const [hours] = sessionDuration.split(':').map(Number);
            return hours >= 20;
        }, [sessionDuration]);

        return (
            <Paper sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
            }}>
                <Box sx={{ zIndex: 2, width: '100%' }}>
                    <Typography variant="h5" fontWeight={800} color="#2C1810">
                        {greeting}, <span style={{ color: '#FF8C00' }}>{username}</span>
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
                        {ordersToday > 0 ? (
                            <>
                                You've processed <strong>{ordersToday}</strong> order{ordersToday !== 1 ? 's' : ''} totaling <strong>रू {salesToday.toLocaleString()}</strong> today.
                                {avgOrderValue > 0 && (
                                    <span style={{ marginLeft: '4px', color: '#10b981' }}>
                                        (Avg: रू {avgOrderValue.toLocaleString()}/order)
                                    </span>
                                )}
                            </>
                        ) : (
                            "No orders processed yet today. Start your first session to begin!"
                        )}
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            onClick={onGoToPOS}
                            disabled={!isSessionActive}
                            sx={{
                                bgcolor: isSessionActive ? '#FF8C00' : '#cbd5e1',
                                color: 'white',
                                boxShadow: isSessionActive ? '0 4px 6px -1px rgb(255 140 0 / 0.3)' : 'none',
                                '&:hover': {
                                    bgcolor: isSessionActive ? '#FF7700' : '#cbd5e1',
                                    boxShadow: isSessionActive ? '0 10px 15px -3px rgb(255 140 0 / 0.4)' : 'none'
                                },
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                borderRadius: '10px'
                            }}
                        >
                            {isSessionActive ? 'Enter POS Terminal' : 'Start Session First'}
                        </Button>

                        {isSessionActive ? (
                            <Button
                                variant="outlined"
                                onClick={onEndSession}
                                sx={{
                                    bgcolor: 'transparent',
                                    border: '1.5px solid #ef4444',
                                    color: '#ef4444',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)', borderColor: '#dc2626' },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: '10px'
                                }}
                            >
                                End Session
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={onStartSession}
                                sx={{
                                    bgcolor: 'transparent',
                                    border: '1.5px solid #22c55e',
                                    color: '#22c55e',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.05)', borderColor: '#16a34a' },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: '10px'
                                }}
                            >
                                Start Session
                            </Button>
                        )}
                    </Box>

                    {isSessionActive && (
                        <Box sx={{
                            mt: 3,
                            p: 2,
                            bgcolor: sessionWarning ? '#fef2f2' : '#f8fafc',
                            borderRadius: '12px',
                            border: sessionWarning ? '1px solid #fecaca' : '1px solid #e2e8f0',
                            maxWidth: '100%'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={800} color="#334155" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
                                    Active Session
                                </Typography>
                                {sessionWarning && (
                                    <Chip
                                        icon={<AlertCircle size={14} />}
                                        label="Close Soon"
                                        size="small"
                                        sx={{
                                            bgcolor: '#ef4444',
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            height: '20px'
                                        }}
                                    />
                                )}
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Started At</Typography>
                                    <Typography variant="body2" fontWeight={600} fontSize="0.8rem">{sessionStartDate || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                                    <Typography variant="body2" fontWeight={700} color={sessionWarning ? '#ef4444' : '#FF8C00'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Clock size={14} />
                                        {sessionDuration || '00:00:00'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Managed By</Typography>
                                    <Typography variant="body2" fontWeight={600} fontSize="0.8rem">{username}</Typography>
                                </Box>
                            </Box>
                            {sessionWarning && (
                                <Typography variant="caption" color="#dc2626" sx={{ mt: 1, display: 'block' }}>
                                    ⚠️ Session will auto-close after 24 hours
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>
        );
    };

export const OccupancyCard: React.FC<{ percentage: number; occupied: number; total: number }> = ({ percentage, occupied, total }) => {
    // Determine status color based on occupancy
    const statusColor = useMemo(() => {
        if (percentage >= 80) return '#ef4444'; // High occupancy - red
        if (percentage >= 50) return '#FF8C00'; // Medium occupancy - orange
        return '#22c55e'; // Low occupancy - green
    }, [percentage]);

    const statusText = useMemo(() => {
        if (percentage >= 80) return 'High';
        if (percentage >= 50) return 'Medium';
        return 'Low';
    }, [percentage]);

    // Safe percentage calculation
    const safePercentage = useMemo(() => {
        if (total === 0) return 0;
        return Math.min(100, Math.max(0, Math.round(percentage)));
    }, [percentage, total]);

    return (
        <Paper sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#64748b">Current Occupancy</Typography>
                <Typography variant="h3" fontWeight={900} color={statusColor} sx={{ my: 1 }}>
                    {safePercentage}%
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                    {occupied}/{total} Table{total !== 1 ? 's' : ''}
                </Typography>
                {total > 0 && (
                    <Chip
                        label={statusText}
                        size="small"
                        sx={{
                            mt: 1,
                            bgcolor: `${statusColor}20`,
                            color: statusColor,
                            fontWeight: 700,
                            fontSize: '0.7rem'
                        }}
                    />
                )}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: `${statusColor}20`, color: statusColor, width: 50, height: 50 }}>
                    🍴
                </Avatar>
            </Box>
            {total === 0 && (
                <Typography variant="caption" color="#94a3b8" sx={{ mt: 2 }}>
                    No tables configured
                </Typography>
            )}
        </Paper>
    );
};

export const PeakTimeChart: React.FC<{ data: number[]; salesData?: number[] }> = ({ data, salesData }) => {
    // Calculate current hour labels dynamically  
    const labels = useMemo(() => {
        const currentHour = new Date().getHours();
        const hours = [];
        for (let i = 23; i >= 0; i--) {
            const hour = (currentHour - i + 24) % 24;
            const period = hour >= 12 ? 'pm' : 'am';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            hours.push(`${displayHour}${period}`);
        }
        return hours;
    }, []);

    // Use sales data if available, otherwise fall back to order count
    const chartData = useMemo(() => {
        if (salesData && salesData.length === 24) {
            return salesData.map(v => Math.max(0, v));
        }
        if (!data || data.length !== 24) {
            return new Array(24).fill(0);
        }
        return data.map(v => Math.max(0, v));
    }, [data, salesData]);

    const maxValue = useMemo(() => Math.max(...chartData, 1), [chartData]);
    const totalSales = useMemo(() => chartData.reduce((a, b) => a + b, 0), [chartData]);
    const peakHour = useMemo(() => {
        if (totalSales === 0) return null;
        const maxIndex = chartData.indexOf(Math.max(...chartData));
        return labels[maxIndex];
    }, [chartData, labels, totalSales]);

    const isSalesData = salesData && salesData.length === 24;

    const options: ApexOptions = {
        chart: {
            id: 'peak-time-bar',
            toolbar: { show: false },
            sparkline: { enabled: false },
            animations: {
                enabled: true,
                speed: 800
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '70%',
                distributed: false,
                colors: {
                    ranges: [{
                        from: 0,
                        to: maxValue,
                        color: '#FF8C00'
                    }]
                }
            }
        },
        dataLabels: { enabled: false },
        tooltip: {
            theme: 'light',
            y: {
                formatter: (value) => isSalesData
                    ? `रू ${value.toLocaleString()}`
                    : `${value} order${value !== 1 ? 's' : ''}`
            }
        },
        xaxis: {
            categories: labels,
            labels: {
                show: true,
                rotate: -45,
                rotateAlways: false,
                style: {
                    fontSize: '9px',
                    colors: '#94a3b8'
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            show: true,
            labels: {
                style: {
                    fontSize: '10px',
                    colors: '#94a3b8'
                },
                formatter: (value) => isSalesData
                    ? `₹${(value / 1000).toFixed(0)}k`
                    : value.toFixed(0)
            }
        },
        grid: {
            show: true,
            borderColor: '#f1f5f9',
            strokeDashArray: 3,
            yaxis: {
                lines: { show: true }
            },
            xaxis: {
                lines: { show: false }
            }
        },
        colors: ['#FF8C00']
    };

    const series = [{
        name: isSalesData ? 'Sales' : 'Orders',
        data: chartData
    }];

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {isSalesData ? 'Sales Revenue (24h)' : 'Peak Time Analysis'}
                    </Typography>
                    {peakHour && (
                        <Typography variant="caption" color="#64748b" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <TrendingUp size={12} />
                            Peak at {peakHour}
                        </Typography>
                    )}
                </Box>
                <Chip
                    label={isSalesData
                        ? `रू ${totalSales.toLocaleString()}`
                        : `${totalSales} orders`
                    }
                    size="small"
                    sx={{
                        bgcolor: '#fff7ed',
                        color: '#FF8C00',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                    }}
                />
            </Box>
            {totalSales > 0 ? (
                <Chart options={options} series={series} type="bar" height={180} />
            ) : (
                <Box sx={{
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    flexDirection: 'column',
                    gap: 1
                }}>
                    <Typography variant="body2">No data yet</Typography>
                    <Typography variant="caption">Chart will appear as sales come in</Typography>
                </Box>
            )}
        </Paper>
    );
};
