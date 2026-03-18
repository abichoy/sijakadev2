import { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import CheckOut from './CheckOut';
import CheckIn from './CheckIn';
import { LogOut, LogIn } from 'lucide-react';

const PeminjamanHeader = () => {
    const [currentTab, setCurrentTab] = useState(0);

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', pb: 8 }}>
            <Box mb={4} textAlign="center">
                <Typography variant="h4" fontWeight="900" color="primary.main">Peminjaman & Pengembalian Jaket Keselamatan</Typography>
                <Typography variant="subtitle1" color="text.secondary" fontWeight="500">
                    Alur Manajemen Keselamatan Maritim Terpadu
                </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} indicatorColor="primary" textColor="primary" variant="fullWidth">
                    <Tab 
                        icon={<LogOut size={20} />} iconPosition="start" 
                        label="Check-Out (Pinjam Baru)" 
                        sx={{ minHeight: 64, fontWeight: 'bold', '&.Mui-selected': { bgcolor: 'primary.50' } }}
                    />
                    <Tab 
                        icon={<LogIn size={20} />} iconPosition="start" 
                        label="Check-In (Pengembalian)" 
                        sx={{ minHeight: 64, fontWeight: 'bold', '&.Mui-selected': { bgcolor: 'primary.50' } }}
                    />
                </Tabs>
            </Box>

            <Box>
                {currentTab === 0 && <CheckOut />}
                {currentTab === 1 && <CheckIn />}
            </Box>
        </Box>
    );
};

export default PeminjamanHeader;
