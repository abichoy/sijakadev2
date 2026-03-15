import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const Kapal = () => {
    const [data, setData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: null, nama_kapal: '', pemilik: '', alamat_pulau: '', kapasitas_penumpang: '' });

    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/kapal`);
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
            setFormData({ id: null, nama_kapal: '', pemilik: '', alamat_pulau: '', kapasitas_penumpang: '' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        try {
            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/kapal/${formData.id}`, formData);
            } else {
                const { id, ...payload } = formData;
                await axios.post(`${import.meta.env.VITE_API_URL}/kapal`, payload);
            }
            handleClose();
            fetchData();
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus data ini?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/kapal/${id}`);
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
                            <TableCell sx={{ fontWeight: 'bold' }}>Nama Kapal</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Pemilik</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Alamat Pulau</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kapasitas (Penumpang)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.nama_kapal}</TableCell>
                                <TableCell>{row.pemilik}</TableCell>
                                <TableCell>{row.alamat_pulau}</TableCell>
                                <TableCell>{row.kapasitas_penumpang}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(row)}><Edit2 size={18} /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(row.id)}><Trash2 size={18} /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center">Tidak ada data.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="800">{editMode ? 'Edit' : 'Tambah'} Kapal</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField label="Nama Kapal" fullWidth value={formData.nama_kapal} onChange={e => setFormData({...formData, nama_kapal: e.target.value})} />
                        <TextField label="Pemilik" fullWidth value={formData.pemilik} onChange={e => setFormData({...formData, pemilik: e.target.value})} />
                        <TextField label="Alamat Pulau" fullWidth value={formData.alamat_pulau} onChange={e => setFormData({...formData, alamat_pulau: e.target.value})} />
                        <TextField label="Kapasitas Penumpang" type="number" fullWidth value={formData.kapasitas_penumpang} onChange={e => setFormData({...formData, kapasitas_penumpang: e.target.value})} />
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

export default Kapal;
