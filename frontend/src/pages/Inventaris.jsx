import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Grid } from '@mui/material';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const Inventaris = () => {
    const [data, setData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, kode_jaket: '', jenis: 'dewasa', kondisi: 'baik', lokasi_penyimpanan: 'Jembatan Baru', keterangan: '' });
    
    // Filter states
    const [filterJenis, setFilterJenis] = useState('');
    const [filterKondisi, setFilterKondisi] = useState('');
    const [filterLokasi, setFilterLokasi] = useState('');

    const lokasiOptions = Array.from(new Set(data.map(d => d.lokasi_penyimpanan)));

    const filteredData = data.filter(item => {
        return (filterJenis === '' || item.jenis === filterJenis) &&
               (filterKondisi === '' || item.kondisi === filterKondisi) &&
               (filterLokasi === '' || item.lokasi_penyimpanan === filterLokasi);
    });

    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/inventaris`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = (item = null) => {
        if (item) {
            setEditMode(true);
            setFormData(item);
        } else {
            setEditMode(false);
            setFormData({ id: null, kode_jaket: '', jenis: 'dewasa', kondisi: 'baik', lokasi_penyimpanan: 'Jembatan Baru', keterangan: '' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        try {
            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/inventaris/${formData.id}`, formData);
            } else {
                const { id: _, ...payload } = formData;
                await axios.post(`${import.meta.env.VITE_API_URL}/api/inventaris`, payload);
            }
            handleClose();
            fetchData();
        } catch (error) {
            console.error('Error saving data:', error);
            alert(error.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus data ini?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/inventaris/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting data:', error);
                alert('Gagal menghapus data');
            }
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="800">Manajemen Inventaris Jaket</Typography>
                <Button variant="contained" startIcon={<Plus />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
                    Tambah Jaket
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
                <TextField select size="small" label="Filter Jenis" value={filterJenis} onChange={e => setFilterJenis(e.target.value)} sx={{ minWidth: 150 }}>
                    <MenuItem value="">Semua Jenis</MenuItem>
                    <MenuItem value="dewasa">Dewasa</MenuItem>
                    <MenuItem value="anak">Anak-Anak</MenuItem>
                </TextField>
                
                <TextField select size="small" label="Filter Kondisi" value={filterKondisi} onChange={e => setFilterKondisi(e.target.value)} sx={{ minWidth: 150 }}>
                    <MenuItem value="">Semua Kondisi</MenuItem>
                    <MenuItem value="baik">Baik</MenuItem>
                    <MenuItem value="dipinjam">Dipinjam</MenuItem>
                    <MenuItem value="rusak">Rusak</MenuItem>
                    <MenuItem value="hilang">Hilang</MenuItem>
                </TextField>

                <TextField select size="small" label="Filter Lokasi" value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)} sx={{ minWidth: 150, flexGrow: 1 }}>
                    <MenuItem value="">Semua Lokasi</MenuItem>
                    {lokasiOptions.map(loc => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                    ))}
                </TextField>
                
                <Box sx={{ ml: 'auto', px: 2, py: 1, bgcolor: 'primary.50', color: 'primary.main', borderRadius: 2, fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Menampilkan {filteredData.length} / {data.length} Jaket
                </Box>
            </Card>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kode Jaket</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Jenis</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kondisi</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Catatan</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.kode_jaket}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{row.jenis}</TableCell>
                                <TableCell>
                                    <Box bgcolor={row.kondisi === 'baik' ? 'success.50' : row.kondisi === 'dipinjam' ? 'info.50' : 'error.50'} 
                                         color={row.kondisi === 'baik' ? 'success.main' : row.kondisi === 'dipinjam' ? 'info.main' : 'error.main'}
                                         p={0.5} px={1.5} borderRadius={1} display="inline-block" fontSize="0.875rem" fontWeight={600} textTransform="capitalize">
                                        {row.kondisi}
                                    </Box>
                                </TableCell>
                                <TableCell>{row.lokasi_penyimpanan}</TableCell>
                                <TableCell sx={{ maxWidth: 200, color: 'text.secondary', fontSize: '0.85rem' }}>{row.keterangan || '-'}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(row)}><Edit2 size={18} /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow><TableCell colSpan={6} align="center">Tidak ada data ditemukan.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="800">{editMode ? 'Edit' : 'Tambah'} Inventaris Jaket</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField label="Kode Jaket Unik / RFID" fullWidth value={formData.kode_jaket} onChange={e => setFormData({...formData, kode_jaket: e.target.value})} />
                        <TextField select label="Jenis Ukuran" fullWidth value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value})}>
                            <MenuItem value="dewasa">Dewasa</MenuItem>
                            <MenuItem value="anak">Anak-Anak</MenuItem>
                        </TextField>
                        <TextField select label="Status Kondisi" fullWidth value={formData.kondisi} onChange={e => setFormData({...formData, kondisi: e.target.value})}>
                            <MenuItem value="baik">Tersedia (Baik)</MenuItem>
                            <MenuItem value="dipinjam">Sedang Dipinjam</MenuItem>
                            <MenuItem value="rusak">Rusak</MenuItem>
                            <MenuItem value="hilang">Hilang</MenuItem>
                        </TextField>
                        <TextField label="Lokasi Penyetokan" fullWidth value={formData.lokasi_penyimpanan || ''} onChange={e => setFormData({...formData, lokasi_penyimpanan: e.target.value})} />
                        <TextField label="Catatan" multiline rows={2} fullWidth value={formData.keterangan || ''} onChange={e => setFormData({...formData, keterangan: e.target.value})} placeholder="Tambahkan catatan jika perlu (opsional)" />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Batal</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2 }}>Simpan</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Inventaris;
