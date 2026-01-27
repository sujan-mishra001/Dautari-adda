import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import {
    LayoutDashboard,
    Store,
    Users,
    ShieldCheck,
    Package,
    ShoppingBag,
    UserCircle,
    BarChart3,
    Settings,
    LogOut,
    Menu as MenuIcon
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useBranch } from '../providers/BranchProvider';

const drawerWidth = 260;

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const { currentBranch, selectBranch, accessibleBranches } = useBranch();
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [branchAnchorEl, setBranchAnchorEl] = useState<null | HTMLElement>(null);

    const menuItems = [
        { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Store size={22} />, label: 'POS Interface', path: '/pos' },
        { icon: <Store size={22} />, label: 'Branches', path: '/branches' },
        { icon: <Users size={22} />, label: 'Staff Management', path: '/users' },
        { icon: <ShieldCheck size={22} />, label: 'Roles & Permissions', path: '/roles' },
        { icon: <Divider />, isDivider: true },
        { icon: <ShoppingBag size={22} />, label: 'Orders', path: '/orders' },
        { icon: <UserCircle size={22} />, label: 'Customers', path: '/customers' },
        { icon: <Package size={22} />, label: 'Inventory', path: '/inventory' },
        { icon: <BarChart3 size={22} />, label: 'Reports', path: '/reports' },
        { icon: <Divider />, isDivider: true },
        { icon: <Settings size={22} />, label: 'Settings', path: '/settings' },
    ];

    const handleLevelClick = (path: string) => {
        navigate(path);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleBranchMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setBranchAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setBranchAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'white',
                    color: '#1e293b',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    borderBottom: '1px solid #e2e8f0'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => setOpen(!open)}
                            edge="start"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: '#FF8C00' }}>
                            Dautari Adda
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Branch Selector */}
                        <Box
                            onClick={handleBranchMenuOpen}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                px: 2,
                                py: 1,
                                borderRadius: '8px',
                                '&:hover': { bgcolor: '#f1f5f9' }
                            }}
                        >
                            <Store size={18} color="#64748b" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>Selected Branch</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{currentBranch?.name || 'Select Branch'}</Typography>
                            </Box>
                        </Box>

                        <Menu
                            anchorEl={branchAnchorEl}
                            open={Boolean(branchAnchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: { width: 220, mt: 1, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
                            }}
                        >
                            <Typography sx={{ px: 2, py: 1, fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Switch Branch</Typography>
                            {accessibleBranches.map((branch) => (
                                <MenuItem
                                    key={branch.id}
                                    onClick={() => { selectBranch(branch.id); handleClose(); }}
                                    selected={currentBranch?.id === branch.id}
                                >
                                    {branch.name}
                                </MenuItem>
                            ))}
                            <Divider />
                            <MenuItem onClick={() => { navigate('/branches/create'); handleClose(); }}>
                                <ListItemIcon><Store size={18} /></ListItemIcon>
                                Create New Branch
                            </MenuItem>
                        </Menu>

                        {/* Profile */}
                        <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#FF8C00', fontWeight: 700 }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: { width: 200, mt: 1, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700}>{user?.username}</Typography>
                                <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                                <ListItemIcon><UserCircle size={18} /></ListItemIcon>
                                My Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                                <ListItemIcon><LogOut size={18} color="#ef4444" /></ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 80,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : 80,
                        boxSizing: 'border-box',
                        bgcolor: 'white',
                        borderRight: '1px solid #e2e8f0',
                        transition: 'width 0.2s',
                        overflowX: 'hidden'
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', py: 2 }}>
                    <List sx={{ px: 2 }}>
                        {menuItems.map((item, index) => (
                            item.isDivider ? (
                                <Divider key={index} sx={{ my: 2 }} />
                            ) : (
                                <ListItem key={item.label} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => handleLevelClick(item.path!)}
                                        selected={location.pathname === item.path}
                                        sx={{
                                            minHeight: 48,
                                            justifyContent: open ? 'initial' : 'center',
                                            px: 2.5,
                                            borderRadius: '8px',
                                            color: location.pathname === item.path ? '#FF8C00' : '#64748b',
                                            bgcolor: location.pathname === item.path ? '#fff7ed' : 'transparent',
                                            '&:hover': {
                                                bgcolor: location.pathname === item.path ? '#fff7ed' : '#f8fafc',
                                                color: '#FF8C00'
                                            }
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: open ? 2 : 'auto',
                                                justifyContent: 'center',
                                                color: 'inherit'
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {open && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontWeight: location.pathname === item.path ? 700 : 500,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
