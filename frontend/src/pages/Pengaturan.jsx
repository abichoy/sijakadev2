import { useState, useEffect } from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Alert, Snackbar } from '@mui/material';
import { ShieldCheck, UserPlus, Edit, Trash2, Key, UserCheck } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';

const Pengaturan = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'petugas' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar(error.response?.data?.message || 'Gagal mengambil data user', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditMode(true);
            setSelectedUser(user);
            setFormData({ username: user.username, password: '', role: user.role });
        } else {
            setEditMode(false);
            setSelectedUser(null);
            setFormData({ username: '', password: '', role: 'petugas' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}`, formData, config);
                showSnackbar('User berhasil diperbarui');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/users`, formData, config);
                showSnackbar('User baru berhasil ditambahkan');
            }
            fetchUsers();
            handleCloseDialog();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Gagal menyimpan data', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar('User berhasil dihapus');
            fetchUsers();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Gagal menghapus user', 'error');
        }
    };

    return (
        <Box>
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <ShieldCheck size={32} className="text-blue-600" />
                <Box>
                    <Typography variant="h5" fontWeight="900" color="primary.main">Pengaturan Sistem</Typography>
                    <Typography variant="subtitle2" color="text.secondary">Manajemen hak akses dan operasional aplikasi SiJaka.</Typography>
                </Box>
            </Box>

            <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h6" fontWeight="800">Manajemen Pengguna</Typography>
                        <Typography variant="caption" color="text.secondary">Kelola akun petugas dan administrator yang dapat mengakses sistem.</Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<UserPlus size={18} />} 
                        onClick={() => handleOpenDialog()}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                    >
                        Tambah User
                    </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'primary.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Terdaftar Pada</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                            <Typography variant="body2" fontWeight="700">{user.username}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={user.role} 
                                            size="small" 
                                            color={user.role === 'admin' ? 'primary' : 'secondary'} 
                                            variant="outlined"
                                            sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                        {dayjs(user.created_at).format('DD MMM YYYY, HH:mm')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(user)}>
                                            <Edit size={16} />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* User Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight="800">{editMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</Typography>
                    <Typography variant="caption" color="text.secondary">{editMode ? 'Perbarui data akun user' : 'Buat akun baru untuk petugas/admin'}</Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField 
                            label="Username" 
                            fullWidth 
                            size="small" 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                        <TextField 
                            label={editMode ? "Password Baru (Kosongkan jika tidak ubah)" : "Password"} 
                            type="password"
                            fullWidth 
                            size="small"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Role Access</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role Access"
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <MenuItem value="petugas">Petugas (Operasional)</MenuItem>
                                <MenuItem value="admin">Admin (Full Access)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Batal</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ px: 4, borderRadius: 2 }}>Simpan User</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Pengaturan;
