import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Grid, TableSortLabel, Snackbar, Alert } from '@mui/material';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const Inventaris = () => {
    const [data, setData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, kode_jaket: '', jenis: 'dewasa', kondisi: 'baik', lokasi_penyimpanan: 'Sungai Pangkajene', keterangan: '' });

    // Sorting state
    const [sortField, setSortField] = useState('kode_jaket');
    const [sortOrder, setSortOrder] = useState('asc');

    // UI States
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [restrictedDialogOpen, setRestrictedDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
    const [warningDialog, setWarningDialog] = useState({ open: false, title: '', message: '' });

    // Filter states
    const [filterJenis, setFilterJenis] = useState('');
    const [filterKondisi, setFilterKondisi] = useState('');
    const [filterLokasi, setFilterLokasi] = useState('');

    const lokasiOptions = Array.from(new Set(data.map(d => d.lokasi_penyimpanan)));

    const filteredData = data
        .filter(item => {
            return (filterJenis === '' || item.jenis === filterJenis) &&
                (filterKondisi === '' || item.kondisi === filterKondisi) &&
                (filterLokasi === '' || item.lokasi_penyimpanan === filterLokasi);
        })
        .sort((a, b) => {
            const fieldA = a[sortField]?.toString().toLowerCase() || '';
            const fieldB = b[sortField]?.toString().toLowerCase() || '';
            if (sortOrder === 'asc') {
                return fieldA > fieldB ? 1 : -1;
            } else {
                return fieldA < fieldB ? 1 : -1;
            }
        });

    const handleSort = (field) => {
        const isAsc = sortField === field && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/inventaris`);
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
            if (item.kondisi === 'dipinjam') {
                setRestrictedDialogOpen(true);
                return;
            }
            setEditMode(true);
            setFormData(item);
        } else {
            setEditMode(false);
            setFormData({ id: null, kode_jaket: '', jenis: 'dewasa', kondisi: 'baik', lokasi_penyimpanan: 'Sungai Pangkajene', keterangan: '' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        if (!formData.kode_jaket || !formData.lokasi_penyimpanan) {
            setSnackbar({ open: true, message: 'Kode Jaket dan Lokasi Penyetokan tidak boleh kosong', severity: 'error' });
            return;
        }

        try {
            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/inventaris/${formData.id}`, formData);
                setSnackbar({ open: true, message: 'Data inventaris berhasil diperbarui', severity: 'success' });
            } else {
                // Check for duplicate kode_jaket
                const isDuplicate = data.some(item => item.kode_jaket.toUpperCase() === formData.kode_jaket.toUpperCase());
                if (isDuplicate) {
                    setWarningDialog({
                        open: true,
                        title: 'KODE JAKET TERDAFTAR',
                        message: `Kode Jaket "${formData.kode_jaket}" sudah ada dalam database. Silakan gunakan kode unik yang lain.`
                    });
                    return;
                }

                const { id: _, ...payload } = formData;
                await axios.post(`${import.meta.env.VITE_API_URL}/inventaris`, payload);
                setSnackbar({ open: true, message: 'Data inventaris berhasil ditambahkan', severity: 'success' });
            }
            handleClose();
            fetchData();
        } catch (error) {
            console.error('Error saving data:', error);
            setSnackbar({ open: true, message: error.response?.data?.message || 'Gagal menyimpan data', severity: 'error' });
        }
    };

    const handleDelete = (id) => {
        setDeleteConfirm({ open: true, id });
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/inventaris/${deleteConfirm.id}`);
            setDeleteConfirm({ open: false, id: null });
            setSnackbar({ open: true, message: 'Data inventaris berhasil dihapus', severity: 'success' });
            fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
            setSnackbar({ open: true, message: 'Gagal menghapus data', severity: 'error' });
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
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel active={sortField === 'kode_jaket'} direction={sortField === 'kode_jaket' ? sortOrder : 'asc'} onClick={() => handleSort('kode_jaket')}>
                                    Kode Jaket
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel active={sortField === 'jenis'} direction={sortField === 'jenis' ? sortOrder : 'asc'} onClick={() => handleSort('jenis')}>
                                    Jenis
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel active={sortField === 'kondisi'} direction={sortField === 'kondisi' ? sortOrder : 'asc'} onClick={() => handleSort('kondisi')}>
                                    Kondisi
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel active={sortField === 'lokasi_penyimpanan'} direction={sortField === 'lokasi_penyimpanan' ? sortOrder : 'asc'} onClick={() => handleSort('lokasi_penyimpanan')}>
                                    Lokasi
                                </TableSortLabel>
                            </TableCell>
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
                                    <IconButton color="error" onClick={() => {
                                        if (row.kondisi === 'dipinjam') {
                                            setWarningDialog({
                                                open: true,
                                                title: 'PENGHAPUSAN DIBATALKAN',
                                                message: 'Data Jaket yang sedang DIPINJAM tidak dapat dihapus. Silakan kembalikan jaket terlebih dahulu.'
                                            });
                                        } else {
                                            handleDelete(row.id);
                                        }
                                    }}><Trash2 size={18} /></IconButton>
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
                        <TextField 
                            label="Jaket Kode Jaket Unik / RFID" 
                            fullWidth 
                            value={formData.kode_jaket} 
                            onChange={e => setFormData({ ...formData, kode_jaket: e.target.value.toUpperCase() })} 
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                            required
                            disabled={editMode}
                            helperText={editMode ? "Kode Jaket / RFID tidak dapat diubah" : ""}
                        />
                        <TextField select label="Jenis Ukuran" fullWidth value={formData.jenis} onChange={e => setFormData({ ...formData, jenis: e.target.value })}>
                            <MenuItem value="dewasa">Dewasa</MenuItem>
                            <MenuItem value="anak">Anak-Anak</MenuItem>
                        </TextField>
                        <TextField select label="Status Kondisi" fullWidth value={formData.kondisi} onChange={e => setFormData({ ...formData, kondisi: e.target.value })}>
                            <MenuItem value="baik">Tersedia (Baik)</MenuItem>
                            <MenuItem value="rusak">Rusak</MenuItem>
                            <MenuItem value="hilang">Hilang</MenuItem>
                        </TextField>
                        <TextField 
                            label="Lokasi Penyetokan" 
                            fullWidth 
                            value={formData.lokasi_penyimpanan || ''} 
                            onChange={e => setFormData({ ...formData, lokasi_penyimpanan: e.target.value })} 
                            required
                        />
                        <TextField label="Catatan" multiline rows={2} fullWidth value={formData.keterangan || ''} onChange={e => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Tambahkan catatan jika perlu (opsional)" />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Batal</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2 }}>Simpan</Button>
                </DialogActions>
            </Dialog>

            {/* Restricted Edit Warning */}
            <Dialog 
                open={restrictedDialogOpen} 
                onClose={() => setRestrictedDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px', maxWidth: '400px', p: 1 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#f59e0b', fontWeight: 900 }}>
                    <ShieldAlert size={28} />
                    AKSES DIBATASI
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" fontWeight="600" gutterBottom>
                        Data Jaket ini tidak dapat diedit saat ini.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Life Jacket ini berstatus **DIPINJAM**. Silakan selesaikan pengembalian jaket (Check-In) terlebih dahulu di menu peminjaman sebelum dapat mengubah data inventaris ini.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={() => setRestrictedDialogOpen(false)}
                        sx={{ bgcolor: '#f59e0b', py: 1.5, borderRadius: '12px', fontWeight: 900, '&:hover': { bgcolor: '#d97706' } }}
                    >
                        SAYA MENGERTI
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for Notifications */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Dialog Konfirmasi Hapus */}
            <Dialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        maxWidth: '440px',
                        width: '100%',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1 }}>
                    Konfirmasi Hapus
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary">
                        Apakah Anda yakin ingin menghapus data inventaris jaket ini? Tindakan ini tidak dapat dibatalkan.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setDeleteConfirm({ open: false, id: null })}
                        sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase' }}
                    >
                        BATAL
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ fontWeight: 700, borderRadius: '20px', px: 3, textTransform: 'uppercase', boxShadow: 'none' }}
                    >
                        HAPUS
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reusable Warning Dialog */}
            <Dialog 
                open={warningDialog.open} 
                onClose={() => setWarningDialog({ ...warningDialog, open: false })}
                PaperProps={{ sx: { borderRadius: '20px', maxWidth: '400px', p: 1 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#f59e0b', fontWeight: 900 }}>
                    <ShieldAlert size={28} />
                    {warningDialog.title}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" fontWeight="600" gutterBottom>
                        {warningDialog.message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={() => setWarningDialog({ ...warningDialog, open: false })}
                        sx={{ bgcolor: '#f59e0b', py: 1.5, borderRadius: '12px', fontWeight: 900, '&:hover': { bgcolor: '#d97706' } }}
                    >
                        MENGERTI
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Inventaris;
