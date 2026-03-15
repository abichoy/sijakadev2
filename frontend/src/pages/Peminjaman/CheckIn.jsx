import { useState, useEffect } from 'react';
import { Box, Typography, Card, Stepper, Step, StepLabel, Button, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import { LogIn, FileWarning, Search } from 'lucide-react';
import axios from 'axios';
const CheckIn = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Data list from backend
    const [activeLoans, setActiveLoans] = useState([]);
    
    // Process states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [inspeksi, setInspeksi] = useState([]); // [{jaket_id, kondisi: 'baik', catatan: ''}]

    const steps = ['Identifikasi Peminjaman', 'Inspeksi & Pengembalian'];

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const fetchActiveLoans = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/peminjaman/aktif`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setActiveLoans(res.data.data);
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal memuat data peminjaman aktif.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeStep === 0) fetchActiveLoans();
    }, [activeStep]);

    const filteredLoans = activeLoans.filter(loan => {
        const query = searchQuery.toLowerCase();
        return loan.Nakhoda?.nama_lengkap?.toLowerCase().includes(query) ||
               loan.Kapal?.nama_kapal?.toLowerCase().includes(query);
    });

    const handleSelectLoan = (transId) => {
        const loan = activeLoans.find(l => l.id === transId);
        if (!loan) return;
        
        setSelectedLoan(loan);
        // default kondisi semua = baik
        const initInspeksi = loan.DetailPeminjaman.map(d => ({
            jaket_id: d.jaket_id,
            kode_jaket: d.Inventaris?.kode_jaket || 'Unknown',
            jenis: d.Inventaris?.jenis || '-',
            kondisi: 'baik',
            catatan: ''
        }));
        setInspeksi(initInspeksi);
        handleNext();
    };

    const handleUpdateKondisi = (jaketId, kondisiBaru) => {
        setInspeksi(prev => prev.map(item => item.jaket_id === jaketId ? { ...item, kondisi: kondisiBaru } : item));
    };

    const handleUpdateCatatan = (jaketId, catatanBaru) => {
        setInspeksi(prev => prev.map(item => item.jaket_id === jaketId ? { ...item, catatan: catatanBaru } : item));
    };

    const handleSubmitCheckIn = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                kondisi_per_jaket: inspeksi.map(i => ({ jaket_id: i.jaket_id, kondisi: i.kondisi, catatan: i.catatan }))
            };
            
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/peminjaman/checkin/${selectedLoan.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert('Pengembalian Berhasil Diproses!');
                window.location.reload();
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Error saat check-in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel StepIconProps={{ sx: { 
                            '&.Mui-active': { color: 'primary.main' }, 
                            '&.Mui-completed': { color: 'success.main' }
                        }}}>
                            <Typography fontWeight={activeStep >= steps.indexOf(label) ? 800 : 500}>{label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                {/* Step 1: Select Active Loan */}
                {activeStep === 0 && (
                    <Box>
                        <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <Search size={28} className="text-blue-500"/>
                            <Typography variant="h6" fontWeight={800}>Data Peminjaman Aktif</Typography>
                        </Box>

                        <TextField
                            size="small"
                            fullWidth
                            label="Cari berdasarkan Nama Nakhoda atau Nama Kapal"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mb: 4 }}
                        />
                        
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                        ) : activeLoans.length === 0 ? (
                            <Box textAlign="center" p={4} bgcolor="grey.50" borderRadius={4}>
                                <Typography color="text.secondary">Tidak ada kapal/nakhoda yang saat ini tercatat meminjam jaket.</Typography>
                            </Box>
                        ) : filteredLoans.length === 0 ? (
                            <Box textAlign="center" p={4} bgcolor="grey.50" borderRadius={4}>
                                <Typography color="text.secondary">Tidak ada daftar peminjaman yang cocok dengan pencarian Anda.</Typography>
                            </Box>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {filteredLoans.map(loan => (
                                    <Card key={loan.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3, '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.200' }, transition: 'all 0.2s' }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">Nakhoda: {loan.Nakhoda?.nama_lengkap}</Typography>
                                            <Typography variant="body2" color="text.secondary">Kapal: {loan.Kapal?.nama_kapal}</Typography>
                                            <Typography variant="caption" color="primary.main" fontWeight="bold" sx={{ mt: 1, display: 'block' }}>
                                                Total Dipinjam: {loan.jumlah_dewasa_dipinjam} Dewasa, {loan.jumlah_anak_dipinjam} Anak
                                            </Typography>
                                        </Box>
                                        <Button variant="contained" onClick={() => handleSelectLoan(loan.id)} sx={{ borderRadius: 8, px: 3 }}>
                                            Proses Pengembalian
                                        </Button>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                {/* Step 2: Inspection */}
                {activeStep === 1 && selectedLoan && (
                    <Box>
                        <Box p={3} bgcolor="primary.50" borderRadius={4} mb={4} border="1px solid" borderColor="primary.100">
                            <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing={1}>Rincian Peminjam</Typography>
                            <Box display="flex" justifyContent="space-between" mt={1}>
                                <Typography variant="h6" fontWeight={900}>{selectedLoan.Nakhoda?.nama_lengkap}</Typography>
                                <Typography variant="h6" fontWeight={800} color="secondary.main">{selectedLoan.Kapal?.nama_kapal}</Typography>
                            </Box>
                        </Box>

                        <Typography variant="h6" fontWeight={800} mb={3}>Inspeksi Fisik Jaket</Typography>
                        
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 3 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'var(--color-slate-100)' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Kode Seri</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Jenis</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Kondisi Pengembalian</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Catatan</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inspeksi.map(item => (
                                        <TableRow key={item.jaket_id}>
                                            <TableCell>{item.kode_jaket}</TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize' }}>{item.jenis}</TableCell>
                                            <TableCell>
                                                <TextField 
                                                    select 
                                                    size="small" 
                                                    fullWidth
                                                    value={item.kondisi}
                                                    onChange={e => handleUpdateKondisi(item.jaket_id, e.target.value)}
                                                    color={item.kondisi === 'baik' ? 'success' : 'error'}
                                                >
                                                    <MenuItem value="baik" sx={{ color: 'success.main', fontWeight: 'bold' }}>Tersedia (Sempurna)</MenuItem>
                                                    <MenuItem value="robek">Rusak / Robek</MenuItem>
                                                    <MenuItem value="berjamur">Rusak / Berjamur parah</MenuItem>
                                                    <MenuItem value="gesper_rusak">Rusak / Tali/Gesper Putus</MenuItem>
                                                    <MenuItem value="hilang" sx={{ color: 'error.main', fontWeight: 'bold' }}>Hilang Tercelup/Jatuh</MenuItem>
                                                </TextField>
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 220 }}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    placeholder="Catatan kondisi jaket ini..."
                                                    value={item.catatan}
                                                    onChange={e => handleUpdateCatatan(item.jaket_id, e.target.value)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>



                        <Box display="flex" gap={2} justifyContent="flex-end" mt={2} pt={3} borderTop="1px solid" borderColor="divider">
                            <Button variant="outlined" onClick={handleBack} sx={{ borderRadius: '12px', px: 4, fontWeight: 'bold' }}>Beranda</Button>
                            <Button variant="contained" color="success" onClick={handleSubmitCheckIn} disabled={loading} startIcon={<LogIn/>} sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 'extrabold', fontSize: '1rem' }}>
                                {loading ? 'Memproses...' : 'Selesaikan Transaksi & Update Stok'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Card>

            <Snackbar open={!!errorMsg} autoHideDuration={6000} onClose={() => setErrorMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setErrorMsg('')} severity="error" sx={{ width: '100%', borderRadius: 2, fontWeight: 'bold' }} variant="filled">
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CheckIn;
