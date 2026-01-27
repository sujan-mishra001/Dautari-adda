import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Avatar,
    Typography
} from '@mui/material';
import { Settings, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

const ProfileMenu: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSettings = () => {
        handleClose();
        navigate('/settings');
    };

    const handleSupport = () => {
        handleClose();
        // Navigate to support page or open support dialog
        navigate('/support');
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <IconButton
                onClick={handleClick}
                sx={{
                    bgcolor: '#fff7ed',
                    border: '2px solid #FF8C00',
                    width: 56,
                    height: 56,
                    transition: 'all 0.3s',
                    '&:hover': {
                        bgcolor: '#FF8C00',
                        transform: 'scale(1.05)',
                        '& .MuiAvatar-root': {
                            color: 'white'
                        }
                    }
                }}
            >
                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'transparent',
                        color: '#FF8C00',
                        fontWeight: 700,
                        fontSize: '1.2rem'
                    }}
                >
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                </Avatar>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        minWidth: 200,
                        borderRadius: '12px',
                        mt: -1,
                        border: '1px solid #e2e8f0',
                        '& .MuiMenuItem-root': {
                            py: 1.5,
                            px: 2,
                            borderRadius: '8px',
                            mx: 1,
                            my: 0.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: '#fff7ed',
                                '& .MuiListItemIcon-root': {
                                    color: '#FF8C00'
                                }
                            }
                        }
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: '#fff7ed',
                            color: '#FF8C00',
                            fontWeight: 700
                        }}
                    >
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {user?.username || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.role || 'Staff'}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                        <Settings size={18} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body2" fontWeight={600}>Settings</Typography>
                    </ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSupport}>
                    <ListItemIcon>
                        <HelpCircle size={18} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body2" fontWeight={600}>Support</Typography>
                    </ListItemText>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogOut size={18} color="#ef4444" />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body2" fontWeight={600} color="#ef4444">Logout</Typography>
                    </ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ProfileMenu;
