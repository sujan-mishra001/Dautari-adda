import React from 'react';
import {
    Grid,
    Box,
    Typography,
    Paper,
    Button,
    Card,
    CardMedia,
    CardContent
} from '@mui/material';
import { QrCode, Download, Share2, ExternalLink } from 'lucide-react';

const DigitalMenu: React.FC = () => {
    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>Digital Menu (QR)</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your contactless digital menu</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<ExternalLink size={18} />}
                    sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#FF7700' }, textTransform: 'none', borderRadius: '10px' }}
                >
                    Live Preview
                </Button>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Your QR Code</Typography>
                        <Box sx={{ bgcolor: '#f8fafc', p: 4, borderRadius: '20px', mb: 4, display: 'inline-block' }}>
                            <QrCode size={200} color="#FF8C00" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button fullWidth variant="outlined" startIcon={<Download size={18} />} sx={{ borderRadius: '12px', textTransform: 'none' }}>Download</Button>
                            <Button fullWidth variant="outlined" startIcon={<Share2 size={18} />} sx={{ borderRadius: '12px', textTransform: 'none' }}>Share Link</Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Appearance Settings</Typography>
                    <Grid container spacing={2}>
                        {[
                            { title: 'Standard Theme', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80' },
                            { title: 'Dark Premium', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80' },
                            { title: 'Minimalist', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },
                        ].map((theme, i) => (
                            <Grid size={{ xs: 6 }} key={i}>
                                <Card sx={{ borderRadius: '16px', cursor: 'pointer', border: i === 0 ? '2px solid #FF8C00' : '1px solid #f1f5f9' }}>
                                    <CardMedia component="img" height="120" image={theme.img} />
                                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                                        <Typography variant="caption" fontWeight={700}>{theme.title}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DigitalMenu;
