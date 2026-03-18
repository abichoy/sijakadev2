import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, TableSortLabel, Snackbar, Alert, Chip } from '@mui/material';
import { Plus, Edit2, Trash2, AlertTriangle, ShieldAlert, Copy } from 'lucide-react';
import axios from 'axios';

const Kapal = () => {
    const [data, setData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, nama_kapal: '', pemilik: '', alamat_pulau: '', kapasitas_penumpang: '' });

    // Sorting state
    const [sortField, setSortField] = useState('nama_kapal');
    const [sortDirection, setSortDirection] = useState('asc');

    // Delete warning dialog
    const [deleteWarning, setDeleteWarning] = useState({ open: false, message: '', relatedNakhoda: '' });

    // Delete confirmation dialog
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Duplicate warning dialog
    const [duplicateWarning, setDuplicateWarning] = useState({ open: false, message: '', existingName: '' });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/kapal`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

    // Sorting logic
    const handleSort = (field) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    const sortedData = [...data].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle nested Nakhoda field
        if (sortField === 'nakhoda') {
            valA = a.Nakhoda?.nama_lengkap || '';
            valB = b.Nakhoda?.nama_lengkap || '';
        }

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleOpen = (item = null) => {
        if (item) {
            setEditMode(true);
            setFormData(item);
        } else {
            setEditMode(false);
            setFormData({ id: null, nama_kapal: '', pemilik: '', alamat_pulau: '', kapasitas_penumpang: '' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/kapal/${formData.id}`, formData, config);
                setSnackbar({ open: true, message: `Data kapal "${formData.nama_kapal}" berhasil diperbarui.`, severity: 'success' });
            } else {
                const { id: _id, ...payload } = formData;
                await axios.post(`${import.meta.env.VITE_API_URL}/kapal`, payload, config);
                setSnackbar({ open: true, message: `Kapal "${formData.nama_kapal}" berhasil ditambahkan.`, severity: 'success' });
            }
            handleClose();
            fetchData();
        } catch (error) {
            console.error('Error saving data:', error);
            if (error.response?.data?.isDuplicate) {
                setDuplicateWarning({
                    open: true,
                    message: error.response.data.message,
                    existingName: error.response.data.existingName || ''
                });
            } else {
                setSnackbar({ open: true, message: 'Gagal menyimpan data: ' + (error.response?.data?.message || error.message), severity: 'error' });
            }
        }
    };

    const handleDelete = (id) => {
        setDeleteConfirm({ open: true, id });
    };

    const handleConfirmDelete = async () => {
        const id = deleteConfirm.id;
        setDeleteConfirm({ open: false, id: null });

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/kapal/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Data kapal berhasil dihapus.', severity: 'success' });
            fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
            if (error.response?.data?.hasRelation) {
                setDeleteWarning({
                    open: true,
                    message: error.response.data.message,
                    relatedNakhoda: error.response.data.relatedNakhoda || ''
                });
            } else {
                setSnackbar({ open: true, message: 'Gagal menghapus data: ' + (error.response?.data?.message || error.message), severity: 'error' });
            }
        }
    };

    const sortableHeaders = [
        { id: 'nama_kapal', label: 'Nama Kapal' },
        { id: 'pemilik', label: 'Pemilik' },
        { id: 'alamat_pulau', label: 'Alamat Pulau' },
        { id: 'kapasitas_penumpang', label: 'Kapasitas (Penumpang)' },
        { id: 'nakhoda', label: 'Relasi Nakhoda' },
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h5" fontWeight="800">Manajemen Kapal</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">Total Data: {data.length} Kapal</Typography>
                </Box>
                <Button variant="contained" startIcon={<Plus />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
                    Tambah Kapal
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                        <TableRow>
                            {sortableHeaders.map((header) => (
                                <TableCell key={header.id} sx={{ fontWeight: 'bold' }}>
                                    <TableSortLabel
                                        active={sortField === header.id}
                                        direction={sortField === header.id ? sortDirection : 'asc'}
                                        onClick={() => handleSort(header.id)}
                                        sx={{
                                            fontWeight: 'bold',
                                            '&.Mui-active': { fontWeight: '900', color: 'primary.main' },
                                            '&:hover': { color: 'primary.main' }
                                        }}
                                    >
                                        {header.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>{row.nama_kapal}</TableCell>
                                <TableCell>{row.pemilik}</TableCell>
                                <TableCell>{row.alamat_pulau}</TableCell>
                                <TableCell>{row.kapasitas_penumpang}</TableCell>
                                <TableCell>
                                    {row.Nakhoda ? (
                                        <Chip 
                                            label={row.Nakhoda.nama_lengkap} 
                                            size="small" 
                                            color="primary" 
                                            variant="outlined"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    ) : (
                                        <Chip 
                                            label="Belum ada" 
                                            size="small" 
                                            color="default" 
                                            variant="outlined"
                                            sx={{ fontWeight: 'bold', opacity: 0.5 }}
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(row)}><Edit2 size={18} /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow><TableCell colSpan={6} align="center">Tidak ada data.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form Tambah/Edit */}
            <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="800">{editMode ? 'Edit' : 'Tambah'} Kapal</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField 
                            label="Nama Kapal" 
                            fullWidth 
                            value={formData.nama_kapal} 
                            onChange={e => setFormData({...formData, nama_kapal: e.target.value.toUpperCase()})} 
                            inputProps={{ style: { textTransform: 'uppercase' } }} 
                            disabled={editMode}
                            helperText={editMode ? "Nama kapal tidak dapat diubah" : ""}
                        />
                        <TextField label="Pemilik" fullWidth value={formData.pemilik} onChange={e => setFormData({...formData, pemilik: e.target.value.toUpperCase()})} inputProps={{ style: { textTransform: 'uppercase' } }} />
                        <TextField label="Alamat Pulau" fullWidth value={formData.alamat_pulau} onChange={e => setFormData({...formData, alamat_pulau: e.target.value.toUpperCase()})} inputProps={{ style: { textTransform: 'uppercase' } }} />
                        <TextField label="Kapasitas Penumpang" type="number" fullWidth value={formData.kapasitas_penumpang} onChange={e => setFormData({...formData, kapasitas_penumpang: e.target.value})} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Batal</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2 }}>Simpan</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Peringatan Nama Duplikat */}
            <Dialog
                open={duplicateWarning.open}
                onClose={() => setDuplicateWarning({ open: false, message: '', existingName: '' })}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        maxWidth: '480px',
                        width: '100%',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: '#f59e0b',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 3,
                        py: 2
                    }}
                >
                    <Copy size={24} />
                    <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: 0.5 }}>
                        DATA SUDAH ADA!
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3, pt: 2 }}>
                        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={36} color="#f59e0b" />
                        </Box>

                        <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
                            {duplicateWarning.message}
                        </Typography>

                        {duplicateWarning.existingName && (
                            <Box sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', p: 2, width: '100%' }}>
                                <Typography variant="caption" fontWeight="800" color="#b45309" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Nama Kapal Terdaftar
                                </Typography>
                                <Typography variant="body1" fontWeight="900" color="#92400e" sx={{ mt: 0.5 }}>
                                    {duplicateWarning.existingName}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setDuplicateWarning({ open: false, message: '', existingName: '' })}
                            sx={{
                                bgcolor: '#1e293b',
                                '&:hover': { bgcolor: '#0f172a' },
                                borderRadius: '12px',
                                py: 1.8,
                                fontWeight: '900',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                mt: 1
                            }}
                        >
                            MENGERTI
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

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
                        Apakah Anda yakin ingin menghapus data kapal ini? Tindakan ini tidak dapat dibatalkan.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setDeleteConfirm({ open: false, id: null })}
                        sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase' }}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ fontWeight: 700, borderRadius: '20px', px: 3, textTransform: 'uppercase', boxShadow: 'none' }}
                    >
                        Hapus
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Peringatan Delete Relasi */}
            <Dialog
                open={deleteWarning.open}
                onClose={() => setDeleteWarning({ open: false, message: '', relatedNakhoda: '' })}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        maxWidth: '480px',
                        width: '100%',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: '#ef4444',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 3,
                        py: 2
                    }}
                >
                    <ShieldAlert size={24} />
                    <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: 0.5 }}>
                        HAPUS DITOLAK!
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3, pt: 2 }}>
                        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={36} color="#ef4444" />
                        </Box>

                        <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
                            {deleteWarning.message}
                        </Typography>

                        {deleteWarning.relatedNakhoda && (
                            <Box sx={{ bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', p: 2, width: '100%' }}>
                                <Typography variant="caption" fontWeight="800" color="#ea580c" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Nakhoda Terkait
                                </Typography>
                                <Typography variant="body1" fontWeight="900" color="#c2410c" sx={{ mt: 0.5 }}>
                                    {deleteWarning.relatedNakhoda}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setDeleteWarning({ open: false, message: '', relatedNakhoda: '' })}
                            sx={{
                                bgcolor: '#1e293b',
                                '&:hover': { bgcolor: '#0f172a' },
                                borderRadius: '12px',
                                py: 1.8,
                                fontWeight: '900',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                mt: 1
                            }}
                        >
                            MENGERTI
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Snackbar Feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%', borderRadius: 2, fontWeight: 'bold' }} 
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Kapal;
