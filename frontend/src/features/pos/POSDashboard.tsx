import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    Button,
    Tooltip,
    Badge,
    Tabs,
    Tab,
    Avatar,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    LayoutGrid,
    ChefHat,
    ShoppingCart,
    Wallet,
    Users,
    User,
    Plus,
    Clock,
    Printer,
    Eye,
    X,
    RefreshCw,
    Beer,
    CreditCard,
    Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { floorsAPI, tablesAPI, ordersAPI, kotAPI } from '../../services/api';

// Types
interface Floor {
    id: number;
    name: string;
    display_order: number;
    is_active: boolean;
}

interface TableData {
    id: number;
    table_id: string;
    floor: string;
    floor_id: number;
    table_type: string;
    capacity: number;
    status: 'Available' | 'Occupied' | 'Reserved' | 'BillRequested';
    kot_count: number;
    bot_count: number;
    active_order_id: number | null;
    total_amount: number;
}

interface KOTData {
    id: number;
    kot_number: string;
    kot_type: 'KOT' | 'BOT';
    status: string;
    created_at: string;
    order?: {
        table?: { table_id: string };
        customer?: { name: string };
    };
    items?: Array<{
        id: number;
        quantity: number;
        menu_item?: { name: string };
    }>;
    created_by_user?: { full_name: string };
}

interface OrderData {
    id: number;
    order_number: string;
    status: string;
    net_amount: number;
    created_at: string;
    table?: { table_id: string };
    customer?: { name: string };
    kots?: Array<{ kot_type: string }>;
}

// Sidebar Navigation
const SidebarNav: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { id: 'tables', icon: LayoutGrid, label: 'Tables' },
        { id: 'kot', icon: ChefHat, label: 'KOT/BOT' },
        { id: 'orders', icon: ShoppingCart, label: 'Orders' },
        { id: 'cashier', icon: Wallet, label: 'Cashier' },
        { id: 'customers', icon: Users, label: 'Customers' },
    ];

    return (
        <Box
            sx={{
                width: 80,
                bgcolor: '#1a1a2e',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
                gap: 1,
                borderRadius: '0 20px 20px 0',
            }}
        >
            {/* Logo */}
            <Box sx={{ mb: 3, p: 1 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: '#FF8C00',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        color: 'white',
                        fontSize: '1.2rem'
                    }}
                >
                    DA
                </Box>
            </Box>

            {/* Nav Items */}
            {navItems.map((item) => (
                <Tooltip key={item.id} title={item.label} placement="right">
                    <IconButton
                        onClick={() => onTabChange(item.id)}
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            bgcolor: activeTab === item.id ? '#FF8C00' : 'transparent',
                            color: activeTab === item.id ? 'white' : '#64748b',
                            '&:hover': {
                                bgcolor: activeTab === item.id ? '#FF8C00' : 'rgba(255,140,0,0.1)',
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        <item.icon size={24} />
                    </IconButton>
                </Tooltip>
            ))}

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* User Avatar */}
            <Tooltip title={user?.full_name || user?.username || 'Account'} placement="right">
                <IconButton
                    onClick={() => navigate('/settings')}
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        mb: 1,
                    }}
                >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#FF8C00' }}>
                        {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                    </Avatar>
                </IconButton>
            </Tooltip>
        </Box>
    );
};

// Table Card Component
const TableCard: React.FC<{
    table: TableData;
    onClick: () => void;
}> = ({ table, onClick }) => {
    const getStatusColor = () => {
        switch (table.status) {
            case 'Available': return { bg: '#ecfdf5', border: '#10b981', text: '#059669' };
            case 'Occupied': return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' };
            case 'Reserved': return { bg: '#ede9fe', border: '#8b5cf6', text: '#7c3aed' };
            case 'BillRequested': return { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' };
            default: return { bg: '#f1f5f9', border: '#94a3b8', text: '#64748b' };
        }
    };

    const colors = getStatusColor();

    return (
        <Paper
            onClick={onClick}
            sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: '16px',
                border: `2px solid ${colors.border}`,
                bgcolor: colors.bg,
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${colors.border}40`,
                },
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={800} color={colors.text}>
                        {table.table_id}
                    </Typography>
                    {table.table_type === 'VIP' && (
                        <Chip label="VIP" size="small" sx={{ bgcolor: '#fbbf24', color: 'white', fontSize: '0.65rem', height: 20 }} />
                    )}
                </Box>
                <Chip
                    label={table.status}
                    size="small"
                    sx={{
                        bgcolor: 'transparent',
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                    }}
                />
            </Box>

            {table.status === 'Occupied' && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {table.kot_count > 0 && (
                        <Chip
                            icon={<ChefHat size={12} />}
                            label={`${table.kot_count}`}
                            size="small"
                            sx={{ bgcolor: '#fff7ed', color: '#ea580c', fontSize: '0.7rem' }}
                        />
                    )}
                    {table.bot_count > 0 && (
                        <Chip
                            icon={<Beer size={12} />}
                            label={`${table.bot_count}`}
                            size="small"
                            sx={{ bgcolor: '#fef3c7', color: '#d97706', fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
            )}

            {table.total_amount > 0 && (
                <Typography variant="body2" fontWeight={700} color={colors.text} sx={{ mt: 1 }}>
                    Rs. {table.total_amount.toLocaleString()}
                </Typography>
            )}
        </Paper>
    );
};

// KOT Card Component
const KOTCard: React.FC<{
    kot: KOTData;
    onStatusUpdate: (id: number, status: string) => void;
}> = ({ kot, onStatusUpdate }) => {
    const getTimeSince = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff}m`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };

    const isPending = kot.status === 'Pending';

    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: '12px',
                border: '2px solid',
                borderColor: isPending ? '#f59e0b' : '#10b981',
                bgcolor: isPending ? '#fff7ed' : '#ecfdf5',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                        {kot.order?.table?.table_id || 'Walk-in'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        #{kot.kot_number}
                    </Typography>
                </Box>
                <Chip
                    label={kot.kot_type}
                    size="small"
                    sx={{
                        bgcolor: kot.kot_type === 'KOT' ? '#FF8C00' : '#8b5cf6',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Clock size={14} />
                <Typography variant="caption" color="text.secondary">
                    {getTimeSince(kot.created_at)} ago
                </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {kot.items?.length || 0} items
            </Typography>

            {isPending ? (
                <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    onClick={() => onStatusUpdate(kot.id, 'Served')}
                    sx={{
                        bgcolor: '#10b981',
                        '&:hover': { bgcolor: '#059669' },
                        textTransform: 'none',
                        borderRadius: '8px',
                    }}
                >
                    Mark Served
                </Button>
            ) : (
                <Chip label="Served" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
            )}
        </Paper>
    );
};

// Order Row Component
const OrderRow: React.FC<{
    order: OrderData;
    onView: () => void;
    onPrint: () => void;
}> = ({ order, onView, onPrint }) => {
    const kotCount = order.kots?.filter(k => k.kot_type === 'KOT').length || 0;
    const botCount = order.kots?.filter(k => k.kot_type === 'BOT').length || 0;

    const getStatusColor = () => {
        switch (order.status) {
            case 'Pending': return '#f59e0b';
            case 'In Progress': return '#3b82f6';
            case 'Completed': return '#10b981';
            case 'Paid': return '#059669';
            case 'Cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <TableRow hover>
            <TableCell sx={{ fontWeight: 600 }}>{order.order_number}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
            <TableCell>{order.table?.table_id || 'N/A'}</TableCell>
            <TableCell>{order.customer?.name || 'Walk-in'}</TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {kotCount > 0 && <Chip label={`K:${kotCount}`} size="small" sx={{ fontSize: '0.65rem' }} />}
                    {botCount > 0 && <Chip label={`B:${botCount}`} size="small" sx={{ fontSize: '0.65rem' }} />}
                </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Rs. {order.net_amount?.toLocaleString()}</TableCell>
            <TableCell>
                <Chip
                    label={order.status}
                    size="small"
                    sx={{ bgcolor: getStatusColor(), color: 'white', fontWeight: 600 }}
                />
            </TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={onView}>
                        <Eye size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={onPrint}>
                        <Printer size={16} />
                    </IconButton>
                </Box>
            </TableCell>
        </TableRow>
    );
};

// Main POS Dashboard Component
const POSDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [activeTab, setActiveTab] = useState('tables');
    const [loading, setLoading] = useState(true);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [tables, setTables] = useState<TableData[]>([]);
    const [kots, setKots] = useState<KOTData[]>([]);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [kotTab, setKotTab] = useState(0); // 0: Pending, 1: All, 2: Served
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

    // Dialog states
    const [floorDialogOpen, setFloorDialogOpen] = useState(false);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);

    // Load data
    const loadFloors = useCallback(async () => {
        try {
            const response = await floorsAPI.getAll();
            setFloors(response.data || []);
            if (response.data?.length > 0 && !selectedFloor) {
                setSelectedFloor(response.data[0].id);
            }
        } catch (error) {
            console.error('Error loading floors:', error);
        }
    }, [selectedFloor]);

    const loadTables = useCallback(async () => {
        try {
            const params = selectedFloor ? { floor_id: selectedFloor } : {};
            const response = await tablesAPI.getAll(params);
            setTables(response.data || []);
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    }, [selectedFloor]);

    const loadKOTs = useCallback(async () => {
        try {
            const statusMap = ['Pending', '', 'Served'];
            const params: any = {};
            if (kotTab !== 1) params.status = statusMap[kotTab];
            const response = await kotAPI.getAll(params);
            setKots(response.data || []);
        } catch (error) {
            console.error('Error loading KOTs:', error);
        }
    }, [kotTab]);

    const loadOrders = useCallback(async () => {
        try {
            const response = await ordersAPI.getAll();
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }, []);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        await Promise.all([loadFloors(), loadTables(), loadKOTs(), loadOrders()]);
        setLoading(false);
    }, [loadFloors, loadTables, loadKOTs, loadOrders]);

    useEffect(() => {
        loadAllData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadAllData, 30000);
        return () => clearInterval(interval);
    }, [loadAllData]);

    useEffect(() => {
        if (selectedFloor) loadTables();
    }, [selectedFloor, loadTables]);

    useEffect(() => {
        loadKOTs();
    }, [kotTab, loadKOTs]);

    // Handlers
    const handleTableClick = (table: TableData) => {
        if (table.active_order_id) {
            navigate(`/pos/order/${table.id}`, { state: { table, orderId: table.active_order_id } });
        } else {
            navigate(`/pos/order/${table.id}`, { state: { table } });
        }
    };

    const handleKOTStatusUpdate = async (kotId: number, status: string) => {
        try {
            await kotAPI.updateStatus(kotId, status);
            await loadKOTs();
            await loadTables();
        } catch (error) {
            console.error('Error updating KOT status:', error);
        }
    };

    const handleRefresh = () => {
        loadAllData();
    };

    // Render Tables View
    const renderTablesView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Floor Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                        value={selectedFloor || ''}
                        onChange={(e) => setSelectedFloor(Number(e.target.value))}
                        displayEmpty
                        sx={{ borderRadius: '12px' }}
                    >
                        {floors.map((floor) => (
                            <MenuItem key={floor.id} value={floor.id}>
                                {floor.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {isAdmin && (
                    <Button
                        variant="outlined"
                        startIcon={<Plus size={16} />}
                        onClick={() => setFloorDialogOpen(true)}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Add Floor & Table
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <IconButton onClick={handleRefresh}>
                    <RefreshCw size={20} />
                </IconButton>
            </Box>

            {/* Tables Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 2,
                    overflowY: 'auto',
                    flex: 1,
                }}
            >
                {tables.map((table) => (
                    <TableCard
                        key={table.id}
                        table={table}
                        onClick={() => handleTableClick(table)}
                    />
                ))}
                {tables.length === 0 && !loading && (
                    <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No tables found. Add tables to get started.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );

    // Render KOT/BOT View
    const renderKOTView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* KOT Tabs */}
            <Tabs
                value={kotTab}
                onChange={(_, v) => setKotTab(v)}
                sx={{ mb: 3 }}
            >
                <Tab label="Pending" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="All" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="Served" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>

            {/* KOT Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 2,
                    overflowY: 'auto',
                    flex: 1,
                }}
            >
                {kots.map((kot) => (
                    <KOTCard
                        key={kot.id}
                        kot={kot}
                        onStatusUpdate={handleKOTStatusUpdate}
                    />
                ))}
                {kots.length === 0 && !loading && (
                    <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                        <ChefHat size={48} color="#e2e8f0" />
                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                            No {kotTab === 0 ? 'pending' : kotTab === 2 ? 'served' : ''} orders
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );

    // Render Orders View
    const renderOrdersView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Live Orders
            </Typography>

            <TableContainer component={Paper} sx={{ flex: 1, borderRadius: '12px' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date/Time</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Table</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>KOT/BOT</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <OrderRow
                                key={order.id}
                                order={order}
                                onView={() => setSelectedOrder(order)}
                                onPrint={() => console.log('Print', order.id)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    // Render Cashier View
    const renderCashierView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={64} color="#e2e8f0" />
            <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
                Cashier Module
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
                Select an order to process payment
            </Typography>
            <Button
                variant="contained"
                startIcon={<CreditCard size={18} />}
                onClick={() => navigate('/pos/cashier')}
                sx={{
                    mt: 3,
                    bgcolor: '#FF8C00',
                    '&:hover': { bgcolor: '#e67e00' },
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                }}
            >
                Open Cashier
            </Button>
        </Box>
    );

    // Render Customers View
    const renderCustomersView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={64} color="#e2e8f0" />
            <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
                Customer Management
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate('/customers')}
                sx={{
                    mt: 3,
                    bgcolor: '#FF8C00',
                    '&:hover': { bgcolor: '#e67e00' },
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                }}
            >
                Manage Customers
            </Button>
        </Box>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'tables': return renderTablesView();
            case 'kot': return renderKOTView();
            case 'orders': return renderOrdersView();
            case 'cashier': return renderCashierView();
            case 'customers': return renderCustomersView();
            default: return renderTablesView();
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc', overflow: 'hidden' }}>
            {/* Sidebar */}
            <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 3,
                        pb: 2,
                        borderBottom: '1px solid #e2e8f0',
                        bgcolor: 'white',
                    }}
                >
                    <Typography variant="h5" fontWeight={800}>
                        {activeTab === 'tables' && 'Table Management'}
                        {activeTab === 'kot' && 'Kitchen & Bar Orders'}
                        {activeTab === 'orders' && 'Order Management'}
                        {activeTab === 'cashier' && 'Cashier'}
                        {activeTab === 'customers' && 'Customers'}
                    </Typography>
                </Box>

                {/* Content Area */}
                <Box sx={{ flex: 1, p: 3, overflow: 'hidden' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress sx={{ color: '#FF8C00' }} />
                        </Box>
                    ) : (
                        renderContent()
                    )}
                </Box>
            </Box>

            {/* Order Details Dialog */}
            <Dialog
                open={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            Order Details - {selectedOrder.order_number}
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Table</Typography>
                                    <Typography fontWeight={600}>{selectedOrder.table?.table_id || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Customer</Typography>
                                    <Typography fontWeight={600}>{selectedOrder.customer?.name || 'Walk-in'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Date/Time</Typography>
                                    <Typography fontWeight={600}>{new Date(selectedOrder.created_at).toLocaleString()}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Typography fontWeight={600}>{selectedOrder.status}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" fontWeight={700}>
                                Total: Rs. {selectedOrder.net_amount?.toLocaleString()}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                            <Button
                                variant="outlined"
                                startIcon={<Printer size={16} />}
                            >
                                Print Bill
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Receipt size={16} />}
                                sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#e67e00' } }}
                            >
                                Generate Bill
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default POSDashboard;
