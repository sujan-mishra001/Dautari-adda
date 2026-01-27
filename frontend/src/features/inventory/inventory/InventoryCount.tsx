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
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    MenuItem
} from '@mui/material';
import { Plus, X } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { inventoryAPI } from '../../../services/api';

const InventoryCount: React.FC = () => {
    const [counts, setCounts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        counted_quantity: 0,
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [countsRes, productsRes] = await Promise.all([
                inventoryAPI.getCounts(),
                inventoryAPI.getProducts()
            ]);
            setCounts(countsRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setCounts([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setFormData({ product_id: '', counted_quantity: 0, notes: '' });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({ product_id: '', counted_quantity: 0, notes: '' });
    };

    const handleSubmit = async () => {
        try {
            await inventoryAPI.createCount(formData);
            handleCloseDialog();
            loadData();
        } catch (error) {
            console.error('Error creating count:', error);
            alert('Error creating count. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>Inventory Count</Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleOpenDialog}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                >
                    New Count
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>System Stock</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Counted Quantity</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Difference</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : counts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No counts found. Create your first count to get started.</TableCell>
                            </TableRow>
                        ) : (
                            counts.map((count) => {
                                const difference = (count.counted_quantity || 0) - (count.product?.current_stock || 0);
                                return (
                                    <TableRow key={count.id} hover>
                                        <TableCell>{new Date(count.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{count.product?.name || 'N/A'}</TableCell>
                                        <TableCell>{count.product?.current_stock || 0}</TableCell>
                                        <TableCell>{count.counted_quantity || 0}</TableCell>
                                        <TableCell sx={{ color: difference !== 0 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                                            {difference > 0 ? '+' : ''}{difference}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight={800}>New Inventory Count</Typography>
                    <IconButton onClick={handleCloseDialog} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            select
                            label="Product"
                            fullWidth
                            value={formData.product_id}
                            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                            required
                        >
                            {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.name} (System: {product.current_stock || 0})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Counted Quantity"
                            type="number"
                            fullWidth
                            value={formData.counted_quantity}
                            onChange={(e) => setFormData({ ...formData, counted_quantity: parseFloat(e.target.value) || 0 })}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                        <TextField
                            label="Notes"
                            multiline
                            rows={3}
                            fullWidth
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#FF8C00' }}>
                                Record Count
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default InventoryCount;
