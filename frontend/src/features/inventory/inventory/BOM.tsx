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
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { inventoryAPI, menuAPI } from '../../../services/api';

const BOM: React.FC = () => {
    const [boms, setBoms] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBOM, setEditingBOM] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', menu_item_id: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bomsRes, menuRes] = await Promise.all([
                inventoryAPI.getBOMs(),
                menuAPI.getItems()
            ]);
            setBoms(bomsRes.data || []);
            setMenuItems(menuRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setBoms([]);
            setMenuItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (bom?: any) => {
        if (bom) {
            setEditingBOM(bom);
            setFormData({ name: bom.name || '', menu_item_id: bom.menu_item_id || '' });
        } else {
            setEditingBOM(null);
            setFormData({ name: '', menu_item_id: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingBOM(null);
        setFormData({ name: '', menu_item_id: '' });
    };

    const handleSubmit = async () => {
        try {
            if (editingBOM) {
                await inventoryAPI.updateBOM(editingBOM.id, formData);
            } else {
                await inventoryAPI.createBOM(formData);
            }
            handleCloseDialog();
            loadData();
        } catch (error) {
            console.error('Error saving BOM:', error);
            alert('Error saving BOM. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>Bills of Materials</Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                >
                    New BOM
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Menu Item</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : boms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No BOMs found. Create your first BOM to get started.</TableCell>
                            </TableRow>
                        ) : (
                            boms.map((bom) => (
                                <TableRow key={bom.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{bom.name || 'N/A'}</TableCell>
                                    <TableCell>{bom.menu_item?.name || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenDialog(bom)}>
                                            <Edit size={16} />
                                        </IconButton>
                                        <IconButton size="small">
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight={800}>{editingBOM ? 'Edit BOM' : 'New BOM'}</Typography>
                    <IconButton onClick={handleCloseDialog} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="BOM Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Coffee Recipe"
                            required
                        />
                        <TextField
                            select
                            label="Menu Item (Optional)"
                            fullWidth
                            value={formData.menu_item_id}
                            onChange={(e) => setFormData({ ...formData, menu_item_id: e.target.value })}
                        >
                            <MenuItem value="">None</MenuItem>
                            {menuItems.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#FF8C00' }}>
                                {editingBOM ? 'Update' : 'Create'}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default BOM;
