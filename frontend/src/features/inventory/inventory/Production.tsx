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
    MenuItem,
    Chip
} from '@mui/material';
import { Plus, X } from 'lucide-react';
import { inventoryAPI } from '../../../services/api';

const Production: React.FC = () => {
    const [productions, setProductions] = useState<any[]>([]);
    const [boms, setBoms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        bom_id: '',
        quantity: 0,
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productionsRes, bomsRes] = await Promise.all([
                inventoryAPI.getProductions(),
                inventoryAPI.getBOMs()
            ]);
            setProductions(productionsRes.data || []);
            setBoms(bomsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setProductions([]);
            setBoms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setFormData({ bom_id: '', quantity: 0, notes: '' });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({ bom_id: '', quantity: 0, notes: '' });
    };

    const handleSubmit = async () => {
        try {
            await inventoryAPI.createProduction(formData);
            handleCloseDialog();
            loadData();
        } catch (error) {
            console.error('Error creating production:', error);
            alert('Error creating production. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#22c55e';
            case 'In Progress': return '#f59e0b';
            case 'Pending': return '#64748b';
            default: return '#64748b';
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>Batch Production</Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleOpenDialog}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                >
                    New Production
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Production Number</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>BOM</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : productions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No productions found. Create your first production to get started.</TableCell>
                            </TableRow>
                        ) : (
                            productions.map((prod) => (
                                <TableRow key={prod.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{prod.production_number || 'N/A'}</TableCell>
                                    <TableCell>{prod.bom?.name || 'N/A'}</TableCell>
                                    <TableCell>{prod.quantity || 0}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={prod.status || 'Pending'}
                                            size="small"
                                            sx={{
                                                bgcolor: `${getStatusColor(prod.status || 'Pending')}15`,
                                                color: getStatusColor(prod.status || 'Pending'),
                                                fontWeight: 700
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(prod.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight={800}>New Batch Production</Typography>
                    <IconButton onClick={handleCloseDialog} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            select
                            label="BOM"
                            fullWidth
                            value={formData.bom_id}
                            onChange={(e) => setFormData({ ...formData, bom_id: e.target.value })}
                            required
                        >
                            {boms.map((bom) => (
                                <MenuItem key={bom.id} value={bom.id}>
                                    {bom.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Production Quantity"
                            type="number"
                            fullWidth
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
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
                                Create Production
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Production;
