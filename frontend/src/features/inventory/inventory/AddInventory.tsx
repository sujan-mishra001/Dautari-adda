import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    MenuItem
} from '@mui/material';
import { Plus } from 'lucide-react';

import { inventoryAPI } from '../../../services/api';

const AddInventory: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        product_id: '',
        quantity: 0,
        notes: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await inventoryAPI.getProducts();
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await inventoryAPI.createTransaction({
                ...formData,
                transaction_type: 'Add'
            });
            alert('Inventory added successfully!');
            setFormData({ product_id: '', quantity: 0, notes: '' });
        } catch (error) {
            console.error('Error adding inventory:', error);
            alert('Error adding inventory. Please try again.');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={800}>Add Inventory</Typography>
                <Typography variant="body2" color="text.secondary">Add stock to existing products</Typography>
            </Box>

            <Paper sx={{ p: 4, borderRadius: '16px', maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            select
                            label="Product"
                            fullWidth
                            value={formData.product_id}
                            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                            required
                            disabled={loading}
                        >
                            {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.name} - Current: {product.current_stock || 0} {product.unit?.abbreviation || ''}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Quantity to Add"
                            type="number"
                            fullWidth
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                        <TextField
                            label="Notes (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any notes about this inventory addition..."
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', py: 1.5 }}
                        >
                            Add Inventory
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default AddInventory;
