import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Grid,
    Alert,
    Snackbar
} from '@mui/material';
import { Save, Store, Bell, Shield, CreditCard, Laptop } from 'lucide-react';

const Settings: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const handleSave = () => {
        setSnackbar({ open: true, message: 'Settings saved successfully' });
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>System Settings</Typography>
                    <Typography variant="body2" color="text.secondary">Configure branch preferences and system behavior</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Save size={18} />}
                    onClick={handleSave}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, borderRadius: '10px', textTransform: 'none' }}
                >
                    Save Changes
                </Button>
            </Box>

            <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }} elevation={0}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                        <Tab icon={<Store size={18} />} iconPosition="start" label="General" sx={{ textTransform: 'none', fontWeight: 700 }} />
                        <Tab icon={<Laptop size={18} />} iconPosition="start" label="POS Behavior" sx={{ textTransform: 'none', fontWeight: 700 }} />
                        <Tab icon={<Bell size={18} />} iconPosition="start" label="Notifications" sx={{ textTransform: 'none', fontWeight: 700 }} />
                        <Tab icon={<CreditCard size={18} />} iconPosition="start" label="Payments" sx={{ textTransform: 'none', fontWeight: 700 }} />
                        <Tab icon={<Shield size={18} />} iconPosition="start" label="Security" sx={{ textTransform: 'none', fontWeight: 700 }} />
                    </Tabs>
                </Box>

                <Box sx={{ p: 4 }}>
                    {tab === 0 && (
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle1" fontWeight={800} gutterBottom>Branch Information</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <TextField label="Restaurant Name" fullWidth defaultValue="Ratala Cafe & Restaurant" />
                                    <TextField label="Contact Number" fullWidth defaultValue="+977 1-456789" />
                                    <TextField label="Email Address" fullWidth defaultValue="info@ratala.com" />
                                    <TextField label="Address" fullWidth multiline rows={2} defaultValue="Kathmandu, Nepal" />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle1" fontWeight={800} gutterBottom>Localization</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <TextField select label="Currency" fullWidth defaultValue="NPR" SelectProps={{ native: true }}>
                                        <option value="NPR">Nepalese Rupee (रू)</option>
                                        <option value="USD">US Dollar ($)</option>
                                    </TextField>
                                    <TextField select label="Timezone" fullWidth defaultValue="Asia/Kathmandu" SelectProps={{ native: true }}>
                                        <option value="Asia/Kathmandu">Kathmandu (GMT+5:45)</option>
                                    </TextField>
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    {tab === 1 && (
                        <Box sx={{ maxWidth: 600 }}>
                            <Typography variant="subtitle1" fontWeight={800} gutterBottom>POS Customization</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <FormControlLabel control={<Switch defaultChecked />} label="Enable Table Reservation" />
                                <FormControlLabel control={<Switch defaultChecked />} label="Show Item Images in POS" />
                                <FormControlLabel control={<Switch />} label="Enable Automatic KOT Printing" />
                                <FormControlLabel control={<Switch defaultChecked />} label="Ask for Customer Info before Billing" />
                                <Divider sx={{ my: 2 }} />
                                <TextField label="Service Charge (%)" type="number" sx={{ width: 200 }} defaultValue={10} />
                                <TextField label="VAT (%)" type="number" sx={{ width: 200, mt: 2 }} defaultValue={13} />
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity="success" sx={{ width: '100%', borderRadius: '12px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Settings;
