import React from 'react';
import {
    Grid,
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress
} from '@mui/material';
import { Calculator, TrendingDown, Target } from 'lucide-react';

const FoodCost: React.FC = () => {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={800}>Food Cost Analysis</Typography>
                <Typography variant="body2" color="text.secondary">Optimize your menu profitability</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#FF8C0015' }}>
                                <Calculator size={24} color="#FF8C00" />
                            </Box>
                            <Typography variant="subtitle2" fontWeight={700}>Avg. Food Cost %</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={800}>28.5%</Typography>
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress variant="determinate" value={28.5} sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }} />
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#22c55e' }}>Ideally should be below 30%</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#3b82f615' }}>
                                <TrendingDown size={24} color="#3b82f6" />
                            </Box>
                            <Typography variant="subtitle2" fontWeight={700}>Potential Savings</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={800}>रू 15,200</Typography>
                        <Typography variant="caption" color="text.secondary">By reducing wastage in Main Course</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#8b5cf615' }}>
                                <Target size={24} color="#8b5cf6" />
                            </Box>
                            <Typography variant="subtitle2" fontWeight={700}>High Margin Items</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={800}>12 Items</Typography>
                        <Typography variant="caption" color="text.secondary">Items with {'>'}70% gross margin</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Selling Price</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Ingredient Cost</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Profit Margin</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { name: 'Espresso', price: 120, cost: 25, margin: '79%', status: 'High Profit' },
                                { name: 'Club Sandwich', price: 450, cost: 180, margin: '60%', status: 'Normal' },
                                { name: 'Momo (C)', price: 250, cost: 120, margin: '52%', status: 'Normal' },
                            ].map((row, i) => (
                                <TableRow key={i} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                                    <TableCell>रू {row.price}</TableCell>
                                    <TableCell>रू {row.cost}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#FF8C00' }}>{row.margin}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ color: row.status === 'High Profit' ? '#22c55e' : '#64748b', fontWeight: 700 }}>
                                            {row.status}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default FoodCost;
