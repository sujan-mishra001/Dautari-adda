import React from 'react';
import {
    Grid,
    Box,
    Typography,
    Paper,
    Button,
    Switch,
    FormControlLabel,
    Avatar
} from '@mui/material';
import { ExternalLink, Settings } from 'lucide-react';

const DeliveryPartners: React.FC = () => {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={800}>Delivery Partners</Typography>
                <Typography variant="body2" color="text.secondary">Connect and manage external delivery platforms</Typography>
            </Box>

            <Grid container spacing={3}>
                {[
                    { name: 'Foodmandu', status: 'Connected', orders: 124, revenue: 54000, color: '#e11d48' },
                    { name: 'Pathao Food', status: 'Connected', orders: 86, revenue: 32000, color: '#22c55e' },
                    { name: 'Bhoj Deals', status: 'Disconnected', orders: 0, revenue: 0, color: '#f59e0b' },
                ].map((partner, i) => (
                    <Grid size={{ xs: 12, md: 4 }} key={i}>
                        <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Avatar sx={{ bgcolor: partner.color, width: 48, height: 48, fontWeight: 800 }}>{partner.name[0]}</Avatar>
                                <FormControlLabel
                                    control={<Switch defaultChecked={partner.status === 'Connected'} color="success" />}
                                    label={<Typography variant="caption">{partner.status}</Typography>}
                                    labelPlacement="start"
                                />
                            </Box>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{partner.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Orders</Typography>
                                    <Typography variant="body2" fontWeight={700}>{partner.orders}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Revenue</Typography>
                                    <Typography variant="body2" fontWeight={700}>रू {partner.revenue.toLocaleString()}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Settings size={14} />}
                                    sx={{ textTransform: 'none', borderRadius: '10px', color: '#64748b', borderColor: '#e2e8f0' }}
                                >
                                    Config
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<ExternalLink size={14} />}
                                    sx={{ textTransform: 'none', borderRadius: '10px', color: '#64748b', borderColor: '#e2e8f0' }}
                                >
                                    Menu
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DeliveryPartners;
