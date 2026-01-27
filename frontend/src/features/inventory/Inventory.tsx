import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    InputAdornment,
    Chip
} from '@mui/material';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';

const Inventory: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.pathname === '/inventory') {
            loadProducts();
        }
    }, [location.pathname]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await inventoryAPI.getProducts();
            setProducts(response.data || []);
        } catch (error) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock': return '#22c55e';
            case 'Low Stock': return '#f59e0b';
            case 'Out of Stock': return '#ef4444';
            default: return '#64748b';
        }
    };

    // If we are on a sub-route, render the Outlet (which will be populated by AppRoutes)
    // Or if we're still using the local sub-route rendering for now (to avoid breaking things)
    if (location.pathname !== '/inventory') {
        return <Outlet />;
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>Inventory Management</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<AlertTriangle size={18} />}
                        sx={{ color: '#ef4444', borderColor: '#ef4444', textTransform: 'none', borderRadius: '10px' }}
                    >
                        Low Stock Alerts
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => navigate('/inventory/add')}
                        sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                    >
                        Add Inventory
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
                <TextField
                    size="small"
                    placeholder="Search inventory..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} color="#64748b" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flexGrow: 1 }}
                />
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Current Stock</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
                        ) : products.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No products found.</TableCell></TableRow>
                        ) : (
                            products.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{item.name || 'N/A'}</TableCell>
                                    <TableCell>{item.category || '-'}</TableCell>
                                    <TableCell>{item.current_stock || 0} {item.unit?.abbreviation || ''}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.status || 'In Stock'}
                                            size="small"
                                            sx={{
                                                bgcolor: `${getStatusColor(item.status || 'In Stock')}15`,
                                                color: getStatusColor(item.status || 'In Stock'),
                                                fontWeight: 700
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" sx={{ textTransform: 'none', color: '#FF8C00' }} onClick={() => navigate(`/inventory/products`)}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Inventory;
