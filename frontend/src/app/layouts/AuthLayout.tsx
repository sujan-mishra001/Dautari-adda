import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8fafc',
                p: 2,
                background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)'
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 450,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <Box sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#FF8C00', mb: 1 }}>Dautari Adda</Typography>
                        <Typography variant="body2" color="text.secondary">Restaurant Management System</Typography>
                    </Box>
                    <Outlet />
                </Box>
            </Paper>
        </Box>
    );
};

export default AuthLayout;
