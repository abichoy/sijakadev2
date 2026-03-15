import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Autocomplete, Snackbar, Alert } from '@mui/material';
import { Plus, Edit2, Trash2, Printer, Camera, Upload, X } from 'lucide-react';
import axios from 'axios';
import Webcam from 'react-webcam';

const Nakhoda = () => {
    const [data, setData] = useState([]);
    const [kapalList, setKapalList] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    const [formData, setFormData] = useState({ id: null, nama_lengkap: '', kontak: '', kapal_id: '' });
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState('');
    const [cameraOpen, setCameraOpen] = useState(false);
    const webcamRef = useRef(null);

    // UI States
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

    // Not implementing true file upload for simplificty without Multer setup overhead.

    const fetchData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/nakhoda`);
            if (res.data.success) setData(res.data.data);
            
            const kRes = await axios.get(`${import.meta.env.VITE_API_URL}/kapal`);
            if (kRes.data.success) setKapalList(kRes.data.data);
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
            setFormData({ 
                id: item.id, 
                nama_lengkap: item.nama_lengkap, 
                kontak: item.kontak || '', 
                kapal_id: item.kapal_id || '' 
            });
            setFotoPreview(item.foto ? `${import.meta.env.VITE_API_URL}${item.foto}` : '');
            setFotoFile(null);
        } else {
            setEditMode(false);
            setFormData({ id: null, nama_lengkap: '', kontak: '', kapal_id: '' });
            setFotoPreview('');
            setFotoFile(null);
        }
        setOpenDialog(true);
        setCameraOpen(false);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setCameraOpen(false);
    };

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            // Convert base64 to File
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'webcam_capture.jpg', { type: 'image/jpeg' });
                    setFotoFile(file);
                    setFotoPreview(imageSrc);
                    setCameraOpen(false);
                });
        }
    }, [webcamRef]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file);
            const objectUrl = URL.createObjectURL(file);
            setFotoPreview(objectUrl);
        }
    };

    const handleSave = async () => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('nama_lengkap', formData.nama_lengkap);
            formDataToSend.append('kontak', formData.kontak);
            formDataToSend.append('kapal_id', formData.kapal_id);
            if (fotoFile) {
                formDataToSend.append('foto', fotoFile);
            }

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/nakhoda/${formData.id}`, formDataToSend, config);
                setSnackbar({ open: true, message: 'Data berhasil diperbarui', severity: 'success' });
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/nakhoda`, formDataToSend, config);
                setSnackbar({ open: true, message: 'Data berhasil ditambahkan', severity: 'success' });
            }
            handleClose();
            fetchData();
        } catch (error) {
            console.error('Error saving data:', error);
            setSnackbar({ open: true, message: 'Gagal menyimpan data', severity: 'error' });
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/nakhoda/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
            fetchData();
            setSnackbar({ open: true, message: 'Data berhasil dihapus', severity: 'success' });
        } catch (error) {
            console.error('Error deleting data:', error);
            setSnackbar({ open: true, message: 'Gagal menghapus data', severity: 'error' });
        }
    };

    const handlePrintKartu = async (id) => {
        try {
            setSnackbar({ open: true, message: 'Menyiapkan dokumen cetak...', severity: 'info' });
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/nakhoda/${id}/kartu`, { responseType: 'text' });
            
            let printIframe = document.getElementById('print-iframe');
            if (!printIframe) {
                printIframe = document.createElement('iframe');
                printIframe.id = 'print-iframe';
                printIframe.style.display = 'none';
                document.body.appendChild(printIframe);
            }
            
            printIframe.contentDocument.open();
            printIframe.contentDocument.write(res.data);
            printIframe.contentDocument.close();
            
            setTimeout(() => {
                printIframe.contentWindow.focus();
                printIframe.contentWindow.print();
            }, 500);
        } catch (error) {
            console.error('Error printing card:', error);
            setSnackbar({ open: true, message: 'Gagal memuat kartu identitas', severity: 'error' });
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h5" fontWeight="800">Manajemen Nakhoda</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">Total Data: {data.length} Nakhoda</Typography>
                </Box>
                <Button variant="contained" startIcon={<Plus />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
                    Tambah Nakhoda
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID Unik / QR Code</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nama Nakhoda</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kapal yang Dibawa</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kontak</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'slate.100', px: 1, py: 0.5, borderRadius: 1, textTransform: 'uppercase' }}>
                                            {row.id.toUpperCase()}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{row.nama_lengkap}</TableCell>
                                <TableCell>{row.Kapal?.nama_kapal || '-'}</TableCell>
                                <TableCell>{row.kontak || '-'}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="secondary" onClick={() => handlePrintKartu(row.id)} title="Cetak Kartu Nakhoda"><Printer size={18} /></IconButton>
                                    <IconButton color="primary" onClick={() => handleOpen(row)}><Edit2 size={18} /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteClick(row.id)}><Trash2 size={18} /></IconButton>
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
                <DialogTitle fontWeight="800">{editMode ? 'Edit' : 'Tambah'} Nakhoda</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField label="Nama Lengkap" fullWidth value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
                        <Autocomplete
                            options={kapalList}
                            getOptionLabel={(option) => option.nama_kapal || ''}
                            value={kapalList.find(k => k.id === formData.kapal_id) || null}
                            onChange={(event, newValue) => {
                                setFormData({...formData, kapal_id: newValue ? newValue.id : ''});
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} label="Pilih Kapal (Ketik untuk mencari)" fullWidth />}
                        />
                        <TextField label="Nomor Kontak (Opsional)" fullWidth value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} />
                        
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" mb={1} fontWeight="bold">Foto Nakhoda (Opsional)</Typography>
                            
                            {!cameraOpen ? (
                                <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                                    {fotoPreview ? (
                                        <Box position="relative" mb={1}>
                                            <img src={fotoPreview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                            <IconButton onClick={() => { setFotoPreview(''); setFotoFile(null); }} size="small" sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
                                                <X size={14} />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box width={120} height={120} bgcolor="grey.200" borderRadius="50%" display="flex" alignItems="center" justifyContent="center">
                                            <Camera size={40} color="#999" />
                                        </Box>
                                    )}
                                    <Box display="flex" gap={2} justifyContent="center" width="100%">
                                        <Button component="label" variant="outlined" startIcon={<Upload size={18} />}>
                                            Unggah File
                                            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                        </Button>
                                        <Button variant="outlined" startIcon={<Camera size={18} />} onClick={() => setCameraOpen(true)}>
                                            Buka Kamera
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                                    <Box borderRadius={2} overflow="hidden" boxShadow="0 4px 10px rgba(0,0,0,0.1)" width="100%" maxWidth={320}>
                                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "user" }} style={{ width: '100%' }} />
                                    </Box>
                                    <Box display="flex" gap={2}>
                                        <Button variant="contained" onClick={capturePhoto} startIcon={<Camera size={18}/>}>
                                            Jepret Foto
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={() => setCameraOpen(false)}>
                                            Tutup Kamera
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Batal</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2 }}>Simpan</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogContent>
                    Apakah Anda yakin ingin menghapus data nakhoda ini? Tindakan ini tidak dapat dibatalkan.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })} color="primary">Batal</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Hapus</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for Notifications */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 'bold' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Nakhoda;
