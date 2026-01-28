import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { TrendingUp } from 'lucide-react';
import Chart from 'react-apexcharts';

export const TopSellingItemsChart: React.FC<{
    items: Array<{ name: string; quantity: number; revenue: number }>;
}> = ({ items }) => {
    const hasData = items && items.length > 0;
    const totalRevenue = useMemo(() => items.reduce((sum, item) => sum + item.revenue, 0), [items]);
    const topItem = useMemo(() => items.length > 0 ? items[0] : null, [items]);

    // Color palette for bars
    const colors = ['#10b981', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

    return (
        <Paper sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            height: '100%'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#64748b">
                        Top 3 Selling Items
                    </Typography>
                    {topItem && (
                        <Typography variant="caption" color="#10b981" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <TrendingUp size={12} />
                            Best: {topItem.name}
                        </Typography>
                    )}
                </Box>
                {hasData && (
                    <Chip
                        label={`रू ${totalRevenue.toLocaleString()}`}
                        size="small"
                        sx={{
                            bgcolor: '#ecfdf5',
                            color: '#10b981',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: '20px'
                        }}
                    />
                )}
            </Box>

            {hasData ? (
                <>
                    {/* Horizontal Bar Chart */}
                    <Box sx={{ mt: 2 }}>
                        <Chart
                            options={{
                                chart: {
                                    type: 'bar',
                                    toolbar: { show: false },
                                    animations: {
                                        enabled: true,
                                        speed: 800
                                    }
                                },
                                plotOptions: {
                                    bar: {
                                        horizontal: true,
                                        borderRadius: 6,
                                        barHeight: '65%',
                                        distributed: true
                                    }
                                },
                                colors: colors.slice(0, items.length),
                                dataLabels: {
                                    enabled: true,
                                    formatter: (val: number) => `रू ${val.toLocaleString()}`,
                                    style: {
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        colors: ['#fff']
                                    },
                                    offsetX: 0
                                },
                                xaxis: {
                                    categories: items.map((item, i) => `${i + 1}. ${item.name}`),
                                    labels: {
                                        formatter: (val: any) => `₹${(Number(val) / 1000).toFixed(0)}k`,
                                        style: {
                                            fontSize: '9px',
                                            colors: '#94a3b8'
                                        }
                                    }
                                },
                                yaxis: {
                                    labels: {
                                        style: {
                                            fontSize: '10px',
                                            colors: '#1e293b',
                                            fontWeight: 600
                                        }
                                    }
                                },
                                grid: {
                                    borderColor: '#f1f5f9',
                                    xaxis: {
                                        lines: { show: true }
                                    },
                                    yaxis: {
                                        lines: { show: false }
                                    }
                                },
                                tooltip: {
                                    theme: 'light',
                                    custom: function ({ dataPointIndex }: any) {
                                        const item = items[dataPointIndex];
                                        return `
                                            <div style="padding: 8px 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                                <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">${item.name}</div>
                                                <div style="font-size: 11px; color: #64748b;">Revenue: रू ${item.revenue.toLocaleString()}</div>
                                                <div style="font-size: 11px; color: #64748b;">Quantity: ${item.quantity} sold</div>
                                            </div>
                                        `;
                                    }
                                },
                                legend: { show: false }
                            }}
                            series={[{
                                name: 'Revenue',
                                data: items.map(item => item.revenue)
                            }]}
                            type="bar"
                            height={items.length * 50 + 30}
                        />
                    </Box>

                    {/* Item Details */}
                    <Box sx={{ mt: 2 }}>
                        {items.map((item, index) => (
                            <Box key={item.name} sx={{
                                mb: 1,
                                p: 1.5,
                                bgcolor: index === 0 ? '#ecfdf520' : '#f8fafc',
                                borderRadius: '8px',
                                border: index === 0 ? '1px solid #10b98140' : '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={index + 1}
                                        size="small"
                                        sx={{
                                            bgcolor: colors[index],
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            height: '20px',
                                            minWidth: '24px'
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} color="#1e293b">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            {item.quantity} sold
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" fontWeight={700} color={index === 0 ? '#10b981' : '#64748b'}>
                                    {totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0}%
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ mt: 2, p: 2, bgcolor: '#ecfdf5', borderRadius: '10px' }}>
                        <Typography variant="caption" color="#64748b" sx={{ display: 'block', lineHeight: 1.5 }}>
                            🔥 <strong>Best Performers:</strong> Top 3 items ranked by total revenue in last 24 hours.
                        </Typography>
                    </Box>
                </>
            ) : (
                <Box sx={{
                    py: 4,
                    textAlign: 'center',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Typography fontSize="2.5rem">📊</Typography>
                    <Typography variant="body2" fontWeight={600}>No Sales Data</Typography>
                    <Typography variant="caption">Top selling items will appear here</Typography>
                </Box>
            )}
        </Paper>
    );
};
