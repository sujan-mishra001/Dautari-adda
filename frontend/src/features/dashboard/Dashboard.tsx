import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { WelcomeCard, OccupancyCard, PeakTimeChart } from '../../components/dashboard/OverviewCards';
import { SalesSummary, OrderDetail } from '../../components/dashboard/SalesSummary';
import { OutstandingRevenue, SalesByArea } from '../../components/dashboard/RevenueAndArea';
import { useAuth } from '../../app/providers/AuthProvider';
import { reportsAPI } from '../../services/api';

import { useNavigate } from 'react-router-dom';

interface DashboardData {
    occupancy: number;
    total_tables: number;
    occupied_tables: number;
    sales_today: number;
    paid_sales: number;
    credit_sales: number;
    discount: number;
    orders_today: number;
    dine_in_count: number;
    takeaway_count: number;
    delivery_count: number;
    outstanding_revenue: number;
    sales_by_area: Array<{ area: string; amount: number }>;
    peak_time_data: number[];
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await reportsAPI.getDashboardSummary();
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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
                        salesToday={data?.sales_today || 0}
                        ordersToday={data?.orders_today || 0}
                        onGoToPOS={() => navigate('/pos')}
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
                    <PeakTimeChart data={data?.peak_time_data || []} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <SalesSummary
                        totalSales={data?.sales_today}
                        paidSales={data?.paid_sales}
                        creditSales={data?.credit_sales}
                        discount={data?.discount}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <OrderDetail
                        totalOrders={data?.orders_today}
                        dineInCount={data?.dine_in_count}
                        takeawayCount={data?.takeaway_count}
                        deliveryCount={data?.delivery_count}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <OutstandingRevenue amount={data?.outstanding_revenue || 0} />
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <SalesByArea data={data?.sales_by_area || []} />
                </Grid>
            </Grid>
        </Box>
    );
};


export default Dashboard;
