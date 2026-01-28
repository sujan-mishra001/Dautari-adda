import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { WelcomeCard, OccupancyCard, PeakTimeChart } from '../../components/dashboard/OverviewCards';
import { SalesSummary, OrderDetail } from '../../components/dashboard/SalesSummary';
import {  SalesByArea } from '../../components/dashboard/RevenueAndArea';
import { TopSellingItemsChart } from '../../components/dashboard/TopSellingChart';
import { useAuth } from '../../app/providers/AuthProvider';
import { reportsAPI, sessionsAPI } from '../../services/api';

import { useNavigate } from 'react-router-dom';

interface DashboardData {
    occupancy: number;
    total_tables: number;
    occupied_tables: number;
    sales_24h: number;
    paid_sales: number;
    credit_sales: number;
    discount: number;
    orders_24h: number;
    dine_in_count: number;
    takeaway_count: number;
    delivery_count: number;
    outstanding_revenue: number;
    top_outstanding_items: Array<{ name: string; amount: number }>;
    top_selling_items: Array<{ name: string; quantity: number; revenue: number }>;
    sales_by_area: Array<{ area: string; amount: number }>;
    peak_time_data: number[];
    hourly_sales: number[];
    period: string;
}

interface Session {
    id: number;
    user_id: number;
    start_time: string;
    end_time: string | null;
    status: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    // Session State
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [sessionDuration, setSessionDuration] = useState<string>('00:00:00');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [dashboardRes, sessionsRes] = await Promise.all([
                    reportsAPI.getDashboardSummary(),
                    sessionsAPI.getAll()
                ]);
                setData(dashboardRes.data);

                // Find active session for current user
                if (user?.id) {
                    const sessions = sessionsRes.data || [];
                    console.log('All sessions:', sessions);
                    console.log('Current user ID:', user.id);

                    const currentSession = sessions.find((s: any) =>
                        s.user_id === user.id && s.status === 'Active'
                    );

                    console.log('Found active session:', currentSession);
                    setActiveSession(currentSession || null);
                } else {
                    console.warn('User ID not available yet');
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    // Timer effect for active session
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (activeSession) {
            const updateTimer = () => {
                const start = new Date(activeSession.start_time).getTime();
                const now = new Date().getTime();
                const diff = now - start;

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setSessionDuration(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            };

            updateTimer(); // Initial call
            interval = setInterval(updateTimer, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeSession]);

    const handleStartSession = async () => {
        try {
            const response = await sessionsAPI.create({
                opening_balance: 0,
                notes: 'Session started from Dashboard'
            });
            setActiveSession(response.data);
            setSnackbar({ open: true, message: 'Session started successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Error starting session:', error);
            setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to start session', severity: 'error' });
        }
    };

    const handleEndSession = async () => {
        if (!activeSession) return;
        if (!confirm('Are you sure you want to end your session?')) return;

        try {
            await sessionsAPI.update(activeSession.id, {
                status: 'Closed',
                closing_balance: 0
            });
            setActiveSession(null);
            setSessionDuration('00:00:00');
            setSnackbar({ open: true, message: 'Session ended successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Error ending session:', error);
            setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to end session', severity: 'error' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#FF8C00' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: '#1e293b' }}>
                Dashboard Overview
            </Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <WelcomeCard
                        username={user?.full_name || user?.username || 'Admin'}
                        salesToday={data?.sales_24h || 0}
                        ordersToday={data?.orders_24h || 0}
                        onGoToPOS={() => navigate('/pos')}
                        isSessionActive={!!activeSession}
                        sessionDuration={sessionDuration}
                        sessionStartDate={activeSession ? new Date(activeSession.start_time).toLocaleDateString() + ' ' + new Date(activeSession.start_time).toLocaleTimeString() : undefined}
                        onStartSession={handleStartSession}
                        onEndSession={handleEndSession}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                    <OccupancyCard
                        percentage={data?.occupancy || 0}
                        occupied={data?.occupied_tables || 0}
                        total={data?.total_tables || 0}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <PeakTimeChart
                        data={data?.peak_time_data || []}
                        salesData={data?.hourly_sales || []}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <SalesSummary
                        totalSales={data?.sales_24h}
                        paidSales={data?.paid_sales}
                        creditSales={data?.credit_sales}
                        discount={data?.discount}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <OrderDetail
                        totalOrders={data?.orders_24h}
                        dineInCount={data?.dine_in_count}
                        takeawayCount={data?.takeaway_count}
                        deliveryCount={data?.delivery_count}
                    />
                </Grid>

              
                <Grid size={{ xs: 12, md: 6 }}>
                    <SalesByArea
                        data={data?.sales_by_area || []}
                        paidSales={data?.paid_sales || 0}
                        creditSales={data?.credit_sales || 0}
                        discount={data?.discount || 0}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TopSellingItemsChart
                        items={data?.top_selling_items || []}
                    />
                </Grid>
            </Grid>

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

export default Dashboard;
