import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Button,
    Tooltip
} from '@mui/material';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Clock,
    BookOpen,
    Utensils,
    Truck,
    BarChart3,
    Settings,
    QrCode,
    Headphones,
    HelpCircle,
    MonitorDot,
    LogOut,
    Menu as MenuIcon,
    ChevronDown,
    Package,
    ShoppingBag,
    UserCog
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = (text: string) => {
        setOpenMenus(prev => ({ ...prev, [text]: !prev[text] }));
    };

    const sidebarItems = [
        ...(user?.role === 'admin' ? [{ text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: `/welcome-${user?.role}` }] : []),
        { text: 'Customers', icon: <Users size={20} />, path: '/customers' },
        {
            text: 'Communications',
            icon: <MessageSquare size={20} />,
            path: '/communications',
            hasSub: true,
            subItems: [
                { text: 'Contact', path: '/communications/contact' },
                { text: 'Bulk SMS feature', path: '/communications/bulk-sms' }
            ]
        },
        { text: 'Sessions', icon: <Clock size={20} />, path: '/sessions' },
        { text: 'Day Book', icon: <BookOpen size={20} />, path: '/day-book' },
    ];

    const restaurantItems = [
        { text: 'Orders', icon: <Utensils size={20} />, path: '/orders' },
        { text: 'Delivery Partners', icon: <Truck size={20} />, path: '/delivery-partners' },
        {
            text: 'Manage Menu',
            icon: <MenuIcon size={20} />,
            path: '/menu',
            hasSub: true,
            subItems: [
                { text: 'Categories', path: '/menu' },
                { text: 'Digital Menu', path: '/digital-menu' }
            ]
        },
        { text: 'Food Cost', icon: <BarChart3 size={20} />, path: '/food-cost' },
    ];

    const setupItems = [
        {
            text: 'User Management',
            icon: <UserCog size={20} />,
            path: '/users',
            hasSub: true,
            adminOnly: true,
            subItems: [
                { text: 'Users', path: '/users' },
                { text: 'Roles', path: '/roles' }
            ]
        },
        {
            text: 'Inventory',
            icon: <Package size={20} />,
            path: '/inventory',
            hasSub: true,
            subItems: [
                { text: 'Units of Measurement', path: '/inventory/units' },
                { text: 'Products', path: '/inventory/products' },
                { text: 'Inventory Adjustment', path: '/inventory/adjustment' },
                { text: 'Add Inventory', path: '/inventory/add' },
                { text: 'Inventory Count', path: '/inventory/count' },
                { text: 'Bills Of Materials', path: '/inventory/bom' },
                { text: 'Batch Production', path: '/inventory/production' }
            ]
        },
        {
            text: 'Purchase',
            icon: <ShoppingBag size={20} />,
            path: '/purchase',
            hasSub: true,
            subItems: [
                { text: 'Supplier', path: '/purchase/supplier' },
                { text: 'Purchase Bill', path: '/purchase/bill' },
                { text: 'Purchase Return', path: '/purchase/return' }
            ]
        },
        { text: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
        { text: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    const renderMenuItems = (items: any[]) => {
        return items.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
            <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => item.hasSub ? toggleMenu(item.text) : navigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                            borderRadius: '10px',
                            '&.Mui-selected': { bgcolor: 'rgba(255, 140, 0, 0.08)', color: '#FF8C00' },
                            '&.Mui-selected .MuiListItemIcon-root': { color: '#FF8C00' }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: '#64748b' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
                        {item.hasSub && (
                            <ChevronDown
                                size={14}
                                style={{
                                    opacity: 0.5,
                                    transition: 'transform 0.2s',
                                    transform: openMenus[item.text] ? 'rotate(180deg)' : 'none'
                                }}
                            />
                        )}
                    </ListItemButton>
                </ListItem>
                {item.hasSub && openMenus[item.text] && (
                    <List disablePadding sx={{ pl: 4 }}>
                        {item.subItems.map((sub: any) => (
                            <ListItem key={sub.text} disablePadding sx={{ mb: 0.2 }}>
                                <ListItemButton
                                    onClick={() => navigate(sub.path)}
                                    selected={location.pathname === sub.path}
                                    sx={{
                                        borderRadius: '8px',
                                        py: 0.5,
                                        '&.Mui-selected': { color: '#FF8C00' }
                                    }}
                                >
                                    <ListItemText
                                        primary={sub.text}
                                        primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </React.Fragment>
        ));
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar
                    src="/logo.png"
                    sx={{
                        width: 100,
                        height: 100,
                        border: '2px solid #f8fafc',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                    }}
                />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
                <List sx={{ mt: 1 }}>
                    {renderMenuItems(sidebarItems)}
                </List>

                <Typography variant="overline" sx={{ px: 2, mt: 2, mb: 1, display: 'block', color: '#94a3b8', fontWeight: 700 }}>
                    Restaurant
                </Typography>
                <List>
                    {renderMenuItems(restaurantItems)}
                </List>

                <Typography variant="overline" sx={{ px: 2, mt: 2, mb: 1, display: 'block', color: '#94a3b8', fontWeight: 700 }}>
                    Setup
                </Typography>
                <List>
                    {renderMenuItems(setupItems)}
                </List>
            </Box>

            <Divider />
            <Box sx={{ p: 2 }}>
                <ListItemButton onClick={handleLogout} sx={{ borderRadius: '10px', color: '#ef4444' }}>
                    <ListItemIcon sx={{ minWidth: 40, color: '#ef4444' }}><LogOut size={20} /></ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { lg: `calc(100% - ${drawerWidth}px)` },
                    ml: { lg: `${drawerWidth}px` },
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid #eee',
                    color: '#2C1810'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { lg: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" fontWeight={700}>
                            Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                            {user?.role === 'admin' && (
                                <>
                                    <Button startIcon={<QrCode size={18} />} sx={{ color: '#FF8C00', textTransform: 'none', fontWeight: 600 }} onClick={() => navigate('/digital-menu')}>
                                        Digital Menu
                                    </Button>
                                    <Button startIcon={<Headphones size={18} />} sx={{ color: '#2C1810', textTransform: 'none', fontWeight: 600 }} onClick={() => navigate('/support')}>
                                        Support
                                    </Button>
                                </>
                            )}
                        </Box>

                        <IconButton size="small" onClick={() => navigate('/help')}>
                            <HelpCircle size={20} />
                        </IconButton>

                        <Button
                            variant="contained"
                            startIcon={<MonitorDot size={18} />}
                            onClick={() => navigate('/pos')}
                            sx={{
                                bgcolor: '#FF8C00',
                                '&:hover': { bgcolor: '#FF7700' },
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '8px',
                                px: 2
                            }}
                        >
                            POS
                        </Button>

                        <Tooltip title="Account settings">
                            <IconButton size="small" sx={{ ml: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF8C00', fontSize: '0.875rem' }}>
                                    {user?.username?.[0].toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #eee' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { lg: `calc(100% - ${drawerWidth}px)` }, mt: '64px' }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default DashboardLayout;
