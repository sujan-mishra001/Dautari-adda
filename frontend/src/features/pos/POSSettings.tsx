import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    CircularProgress,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    User,
    LayoutGrid,
    BookOpen,
    MoreVertical,
    Plus,
    ListChecks
} from 'lucide-react';
import { menuAPI, authAPI } from '../../services/api';

const POSSettings: React.FC = () => {
    const [sidebarTab, setSidebarTab] = useState(2);
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [groupDialog, setGroupDialog] = useState(false);
    const [itemDialog, setItemDialog] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<any>({ name: '', type: 'KOT', status: 'Active' });
    const [currentGroup, setCurrentGroup] = useState<any>({ name: '', category_id: '', status: 'Active' });
    const [currentItem, setCurrentItem] = useState<any>({ name: '', category_id: '', group_id: '', price: 0, kot_bot: 'KOT', inventory_tracking: false, status: 'Active' });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [menuType, setMenuType] = useState<'item' | 'category' | 'group' | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [userRes, itemsRes, catsRes, groupsRes] = await Promise.all([
                authAPI.getCurrentUser(),
                menuAPI.getItems(),
                menuAPI.getCategories(),
                menuAPI.getGroups()
            ]);
            setCurrentUser(userRes.data);
            setItems(itemsRes.data || []);
            setCategories(catsRes.data || []);
            setGroups(groupsRes.data || []);
        } catch (error) {
            console.error("Error loading settings data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number, type: 'item' | 'category' | 'group') => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
        setMenuType(type);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
        setMenuType(null);
    };

    const handleDelete = async () => {
        if (!selectedId || !menuType) return;
        if (!window.confirm(`Are you sure you want to delete this ${menuType}?`)) return;

        try {
            if (menuType === 'item') await menuAPI.deleteItem(selectedId);
            else if (menuType === 'category') await menuAPI.deleteCategory(selectedId);
            else if (menuType === 'group') await menuAPI.deleteGroup(selectedId);
            loadData();
            handleMenuClose();
        } catch (error) {
            alert("Error deleting item");
        }
    };

    const handleSaveCategory = async () => {
        try {
            if (currentCategory.id) await menuAPI.updateCategory(currentCategory.id, currentCategory);
            else await menuAPI.createCategory(currentCategory);
            setCategoryDialog(false);
            setCurrentCategory({ name: '', type: 'KOT', status: 'Active' });
            loadData();
        } catch (error) { alert("Error saving category"); }
    };

    const handleSaveGroup = async () => {
        try {
            if (currentGroup.id) await menuAPI.updateGroup(currentGroup.id, currentGroup);
            else await menuAPI.createGroup(currentGroup);
            setGroupDialog(false);
            setCurrentGroup({ name: '', category_id: '', status: 'Active' });
            loadData();
        } catch (error) { alert("Error saving group"); }
    };

    const handleSaveItem = async () => {
        try {
            if (currentItem.id) await menuAPI.updateItem(currentItem.id, currentItem);
            else await menuAPI.createItem(currentItem);
            setItemDialog(false);
            setCurrentItem({ name: '', category_id: '', group_id: '', price: 0, kot_bot: 'KOT', inventory_tracking: false, status: 'Active' });
            loadData();
        } catch (error) { alert("Error saving menu item"); }
    };

    const sidebarItems = [
        { label: 'Profile', icon: <User size={18} /> },
        { label: 'Category', icon: <LayoutGrid size={18} /> },
        { label: 'Menu Items', icon: <BookOpen size={18} /> },
        { label: 'Toppings', icon: <ListChecks size={18} /> },
    ];

    if (loading && !currentUser) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight={800}>POS Settings</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 4 }}>
                {/* Sidebar */}
                <Paper sx={{ width: 240, borderRadius: '16px', overflow: 'hidden' }} elevation={0}>
                    <Tabs
                        orientation="vertical"
                        value={sidebarTab}
                        onChange={(_, v) => setSidebarTab(v)}
                        sx={{
                            borderRight: 1, borderColor: 'divider',
                            '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', textTransform: 'none', fontWeight: 600, py: 2 }
                        }}
                    >
                        {sidebarItems.map((item, index) => (
                            <Tab key={index} label={item.label} icon={item.icon} iconPosition="start" />
                        ))}
                    </Tabs>
                </Paper>

                {/* Content */}
                <Box sx={{ flexGrow: 1 }}>
                    {sidebarTab === 0 && currentUser && (
                        <Paper sx={{ p: 3, borderRadius: '16px' }}>
                            <Typography variant="h6" fontWeight={800} gutterBottom>Profile Information</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 3 }}>
                                <TextField label="Username" defaultValue={currentUser.username} disabled fullWidth />
                                <TextField label="Role" defaultValue={currentUser.role} disabled fullWidth />
                                <TextField label="Display Name" defaultValue={currentUser.full_name} fullWidth />
                                <TextField label="Email" defaultValue={currentUser.email} fullWidth />
                            </Box>
                            <Button variant="contained" sx={{ mt: 3, bgcolor: '#FF8C00' }}>Update Profile</Button>
                        </Paper>
                    )}

                    {sidebarTab === 1 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight={800}>Categories & Groups</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" startIcon={<Plus size={18} />} onClick={() => setCategoryDialog(true)}>Add Category</Button>
                                    <Button variant="outlined" startIcon={<Plus size={18} />} onClick={() => setGroupDialog(true)}>Add Group</Button>
                                </Box>
                            </Box>
                            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800 }}>Category Name</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {categories.map((cat) => (
                                            <TableRow key={cat.id}>
                                                <TableCell sx={{ fontWeight: 600 }}>{cat.name}</TableCell>
                                                <TableCell><Chip label={cat.type} size="small" /></TableCell>
                                                <TableCell><Chip label={cat.status} size="small" color={cat.status === 'Active' ? 'success' : 'default'} /></TableCell>
                                                <TableCell align="right">
                                                    <IconButton onClick={(e) => handleMenuOpen(e, cat.id, 'category')}><MoreVertical size={18} /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {sidebarTab === 2 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight={800}>Menu Items</Typography>
                                <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setItemDialog(true)} sx={{ bgcolor: '#FF8C00' }}>Add Item</Button>
                            </Box>
                            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800 }}>Item Name</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Price</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                                                <TableCell>{item.category?.name}</TableCell>
                                                <TableCell>Rs. {item.price}</TableCell>
                                                <TableCell><Chip label={item.status} size="small" color={item.status === 'Active' ? 'success' : 'default'} /></TableCell>
                                                <TableCell align="right">
                                                    <IconButton onClick={(e) => handleMenuOpen(e, item.id, 'item')}><MoreVertical size={18} /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Common Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => {
                    if (menuType === 'item') {
                        const item = items.find(i => i.id === selectedId);
                        setCurrentItem(item);
                        setItemDialog(true);
                    } else if (menuType === 'category') {
                        const cat = categories.find(c => c.id === selectedId);
                        setCurrentCategory(cat);
                        setCategoryDialog(true);
                    }
                    handleMenuClose();
                }}>Edit</MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
            </Menu>

            {/* Dialogs */}
            <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)}>
                <DialogTitle>{currentCategory.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Category Name" fullWidth value={currentCategory.name} onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })} />
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={currentCategory.type} onChange={(e: any) => setCurrentCategory({ ...currentCategory, type: e.target.value })}>
                            <MenuItem value="KOT">KOT</MenuItem>
                            <MenuItem value="BOT">BOT</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveCategory} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={groupDialog} onClose={() => setGroupDialog(false)}>
                <DialogTitle>{currentGroup.id ? 'Edit Group' : 'Add Group'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Group Name" fullWidth value={currentGroup.name} onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })} />
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select label="Category" value={currentGroup.category_id} onChange={(e: any) => setCurrentGroup({ ...currentGroup, category_id: e.target.value })}>
                            {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGroupDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveGroup} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={itemDialog} onClose={() => setItemDialog(false)}>
                <DialogTitle>{currentItem.id ? 'Edit Item' : 'Add Item'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
                    <TextField label="Item Name" fullWidth value={currentItem.name} onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })} />
                    <TextField label="Price" type="number" fullWidth value={currentItem.price} onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })} />
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select label="Category" value={currentItem.category_id} onChange={(e: any) => setCurrentItem({ ...currentItem, category_id: e.target.value })}>
                            {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Group</InputLabel>
                        <Select label="Group" value={currentItem.group_id} onChange={(e: any) => setCurrentItem({ ...currentItem, group_id: e.target.value })}>
                            {groups.filter(g => g.category_id === currentItem.category_id).map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItemDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveItem} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default POSSettings;
