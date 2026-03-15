import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Fab, Table, TableBody, TableCell, TableHead, TableRow, Paper, Avatar } from '@mui/material';
import { SendToBack, Package, Navigation, AlertTriangle, UserCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stok, setStok] = useState({ tersedia: 0, dipinjam: 0, rusak: 0, hilang: 0 });
    const [peminjamanHariIni, setPeminjamanHariIni] = useState(0);
    const [kepatuhan, setKepatuhan] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const stokRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stok`, config);
                const pRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/peminjaman-hari-ini`, config);
                const kRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/laporan/kepatuhan`, config);
                
                if (stokRes.data.success) {
                    let st = { tersedia: 0, dipinjam: 0, rusak: 0, hilang: 0 };
                    stokRes.data.data.forEach(item => {
                        const count = parseInt(item.jumlah);
                        if (item.kondisi === 'baik') st.tersedia += count;
                        if (item.kondisi === 'dipinjam') st.dipinjam += count;
                        if (item.kondisi === 'rusak') st.rusak += count;
                        if (item.kondisi === 'hilang') st.hilang += count;
                    });
                    setStok(st);
                }
                
                if (pRes.data.success) {
                    setPeminjamanHariIni(pRes.data.data);
                }

                if (kRes.data.success) {
                    setKepatuhan(kRes.data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const cards = [
        { title: 'Tersedia', value: stok.tersedia, icon: <Package size={32} />, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { title: 'Dipinjam', value: stok.dipinjam, icon: <Navigation size={32} />, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
        { title: 'Rusak / Hilang', value: stok.rusak + stok.hilang, icon: <AlertTriangle size={32} />, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        { title: 'Peminjaman Hari Ini', value: peminjamanHariIni, icon: <SendToBack size={32} />, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    ];

    const chartData = {
        labels: ['Stok Tersedia', 'Dipinjam', 'Rusak', 'Hilang'],
        datasets: [
            {
                label: 'Jumlah Jaket Keselamatan',
                data: [stok.tersedia, stok.dipinjam, stok.rusak, stok.hilang],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                borderRadius: 8,
            }
        ],
    };

    return (
        <Box sx={{ pb: 10 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="900" color="text.primary">Dashboard Monitoring</Typography>
                <Typography variant="subtitle1" color="text.secondary" fontWeight="500">Ringkasan ketersediaan jaket dan log aktivitas dermaga.</Typography>
            </Box>

            <Grid container spacing={3} mb={4}>
                {cards.map((card, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Card sx={{ 
                            borderRadius: '24px', 
                            background: card.gradient,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: `0 10px 30px -10px ${card.color}`,
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 20px 40px -15px ${card.color}` }
                        }}>
                            <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.2, transform: 'scale(2) rotate(15deg)' }}>
                                {card.icon}
                            </Box>
                            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, pb: '24px !important' }}>
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, backdropFilter: 'blur(10px)' }}>
                                    {card.icon}
                                </Box>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, opacity: 0.9, letterSpacing: 1 }}>{card.title}</Typography>
                                <Typography variant="h3" fontWeight="900" sx={{ mt: 0.5, letterSpacing: -1 }}>{card.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', p: 3 }}>
                        <Typography variant="h6" fontWeight="800" mb={3}>Grafik Ketersediaan Inventaris</Typography>
                        <Box sx={{ height: 350, display: 'flex', justifyContent: 'center' }}>
                            <Bar 
                                data={chartData} 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'top' } },
                                    scales: { y: { beginAtZero: true } }
                                }} 
                            />
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight="800">Peringatan Kepatuhan</Typography>
                            <Box sx={{ p: 1, bgcolor: 'error.light', borderRadius: '12px', color: 'error.main' }}>
                                <AlertTriangle size={20} />
                            </Box>
                        </Box>
                        
                        {kepatuhan.length === 0 ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={250} opacity={0.5}>
                                <Settings size={48} />
                                <Typography mt={2} fontWeight={600}>Tidak ada pelanggaran waktu check-in.</Typography>
                            </Box>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {kepatuhan.slice(0, 5).map((log, idx) => (
                                    <Box key={idx} sx={{ p: 2, borderRadius: '16px', bgcolor: 'error.50', border: '1px solid', borderColor: 'error.100', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                                            <UserCircle size={24} />
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography variant="subtitle2" fontWeight={800} color="text.primary">{log.Nakhoda?.nama_lengkap}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">Kapal: {log.Kapal?.nama_kapal}</Typography>
                                            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800, mt: 0.5, p: 0.5, bgcolor: 'white', borderRadius: 1, display: 'inline-block' }}>Terlambat Check-in</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>

            {/* Floating Action Button for Checkout (Tactile UI) */}
            <Fab 
                color="primary" 
                aria-label="add" 
                onClick={() => navigate('/checkout')}
                sx={{ 
                    position: 'fixed', 
                    bottom: 40, 
                    right: 40, 
                    width: 72, 
                    height: 72, 
                    boxShadow: '0 10px 30px rgba(0,99,156,0.4)',
                    background: 'linear-gradient(135deg, #00639C 0%, #1e3a8a 100%)',
                    '&:hover': { transform: 'scale(1.05)' }
                }}
            >
                <SendToBack size={36} />
            </Fab>
        </Box>
    );
};

export default Dashboard;
