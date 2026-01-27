import React from 'react';
import { Box, Typography, Paper, Button, Avatar } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export const WelcomeCard: React.FC<{
    username: string;
    salesToday: number;
    ordersToday: number;
    onGoToPOS?: () => void;
}> = ({ username, salesToday, ordersToday, onGoToPOS }) => (
    <Paper sx={{
        p: 3,
        borderRadius: '16px',
        bgcolor: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        height: '100%'
    }}>
        <Box sx={{ zIndex: 2 }}>
            <Typography variant="h5" fontWeight={800} color="#2C1810">
                Good Evening, <span style={{ color: '#FF8C00' }}>{username}</span>
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
                You've processed <strong>{ordersToday}</strong> orders totaling <strong>रू {salesToday.toLocaleString()}</strong> today.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={onGoToPOS}
                    sx={{
                        bgcolor: '#FF8C00',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgb(255 140 0 / 0.3)',
                        '&:hover': { bgcolor: '#FF7700', boxShadow: '0 10px 15px -3px rgb(255 140 0 / 0.4)' },
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        borderRadius: '10px'
                    }}
                >
                    Enter POS Terminal
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        bgcolor: 'transparent',
                        border: '1.5px solid #FF8C00',
                        color: '#FF8C00',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'rgba(255, 140, 0, 0.05)', borderColor: '#FF8C00' },
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '10px'
                    }}
                >
                    End Session
                </Button>
            </Box>
        </Box>
        <Box
            component="img"
            src="/cafe-illustration.png"
            sx={{
                width: 150,
                height: 150,
                objectFit: 'contain',
                position: 'absolute',
                right: -10,
                bottom: -10,
                opacity: 0.1
            }}
        />
    </Paper>
);

export const OccupancyCard: React.FC<{ percentage: number; occupied: number; total: number }> = ({ percentage, occupied, total }) => (
    <Paper sx={{
        p: 3,
        borderRadius: '16px',
        bgcolor: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        textAlign: 'center',
        height: '100%'
    }}>
        <Typography variant="subtitle2" fontWeight={700} color="#64748b">Current Occupancy</Typography>
        <Typography variant="h3" fontWeight={900} color="#FF8C00" sx={{ my: 1 }}>{percentage}%</Typography>
        <Typography variant="body2" color="#94a3b8">({occupied}/{total} Tables)</Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00' }}>🍴</Avatar>
        </Box>
    </Paper>
);

export const PeakTimeChart: React.FC<{ data: number[] }> = ({ data }) => {
    const options: ApexOptions = {
        chart: { id: 'peak-time', toolbar: { show: false }, sparkline: { enabled: true } },
        stroke: { curve: 'smooth', width: 2, colors: ['#FF8C00'] },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
        tooltip: { theme: 'light' },
        xaxis: { categories: ['12pm', '2pm', '4pm', '6pm', '8pm', '10pm', '12am'] }
    };
    const series = [{ name: 'Orders', data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0] }];

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>Peak Time</Typography>
                <Box sx={{ bgcolor: '#eee', borderRadius: '8px', p: 0.5, display: 'flex' }}>
                    <Button size="small" variant="contained" sx={{ bgcolor: '#fff', color: '#2C1810', boxShadow: 'none', textTransform: 'none', borderRadius: '6px' }}>Hourly</Button>
                    <Button size="small" sx={{ color: '#64748b', textTransform: 'none' }}>Daily</Button>
                </Box>
            </Box>
            <Chart options={options} series={series} type="area" height={80} />
        </Paper>
    );
};
