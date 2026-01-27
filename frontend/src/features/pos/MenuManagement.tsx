import React, { useState } from 'react';
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
    Tabs,
    Tab,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Avatar,
    InputAdornment
} from '@mui/material';
import { Plus, Search, X, MoreVertical } from 'lucide-react';

const MENU_ITEMS = [
    { id: 1, name: 'Dautari Special Thali', category: 'FOOD', group: 'Main Course', price: 850, image: '🍽️' },
    { id: 2, name: 'kodo-roti', category: 'FOOD', group: '-', price: 50, image: '🫓' },
    { id: 3, name: 'chicken dally momo', category: 'FOOD', group: '-', price: 170, image: '🥟' },
];

const MenuManagement: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [openAddItem, setOpenAddItem] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>Menu Management</Typography>
                <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setOpenAddItem(true)} sx={{ bgcolor: '#FF8C00' }}>
                    Add Item
                </Button>
            </Box>

            <Paper sx={{ borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Tab label="MENU ITEMS" />
                    <Tab label="CATEGORY" />
                    <Tab label="GROUP" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search Menu Items"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        sx={{ mb: 3 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
                    />

                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>IMAGE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>NAME</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>PRICE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {MENU_ITEMS.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell><Avatar sx={{ width: 32, height: 32, bgcolor: '#f1f5f9' }}>{item.image}</Avatar></TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Rs. {item.price}</TableCell>
                                        <TableCell><IconButton size="small"><MoreVertical size={16} /></IconButton></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>

            <Dialog open={openAddItem} onClose={() => setOpenAddItem(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight={800}>ADD NEW MENU ITEM</Typography>
                    <IconButton onClick={() => setOpenAddItem(false)} size="small"><X size={20} /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField label="PRODUCT NAME" required fullWidth />
                        <TextField label="PRICE" type="number" required fullWidth />
                        <Button variant="contained" sx={{ bgcolor: '#FF8C00' }}>Save Item</Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MenuManagement;
