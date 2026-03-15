import { useState, useRef } from 'react';
import {
    Box, Typography, Card, Avatar, Button, TextField, Divider,
    IconButton, InputAdornment, Alert, Snackbar, CircularProgress
} from '@mui/material';
import { Camera, Eye, EyeOff, Save, User, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    // Avatar preview
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
    const [avatarFile, setAvatarFile] = useState(null);

    // Username form
    const [username, setUsername] = useState(user?.username || '');

    // Password form
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // State
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showSnack('Ukuran gambar maksimal 2MB', 'error');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        // Validate password fields
        if (newPwd || confirmPwd || currentPwd) {
            if (!currentPwd) {
                showSnack('Password saat ini harus diisi untuk mengganti password', 'error');
                return;
            }
            if (newPwd !== confirmPwd) {
                showSnack('Password baru dan konfirmasi tidak cocok', 'error');
                return;
            }
            if (newPwd.length < 6) {
                showSnack('Password baru minimal 6 karakter', 'error');
                return;
            }
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('username', username);
            if (currentPwd) formData.append('current_password', currentPwd);
            if (newPwd) formData.append('new_password', newPwd);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                const { accessToken, ...userData } = res.data.data;
                updateUser(userData, accessToken);
                setCurrentPwd('');
                setNewPwd('');
                setConfirmPwd('');
                setAvatarFile(null);
                showSnack('Profil berhasil diperbarui!', 'success');
            }
        } catch (err) {
            showSnack(err.response?.data?.message || 'Gagal memperbarui profil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const initials = (user?.username || 'U').charAt(0).toUpperCase();

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', pb: 6 }}>
            <Typography variant="h5" fontWeight={900} mb={1}>Pengaturan Profil</Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
                Kelola foto profil, username, dan keamanan akun Anda.
            </Typography>

            {/* Avatar Card */}
            <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1}>
                    <Camera size={20} /> Foto Profil
                </Typography>
                <Box display="flex" alignItems="center" gap={4} flexWrap="wrap">
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={avatarPreview}
                            sx={{ width: 100, height: 100, fontSize: '2.5rem', bgcolor: 'secondary.main', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                        >
                            {!avatarPreview && initials}
                        </Avatar>
                        <IconButton
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                position: 'absolute', bottom: 0, right: 0,
                                bgcolor: 'primary.main', color: 'white', width: 32, height: 32,
                                '&:hover': { bgcolor: 'primary.dark' },
                                boxShadow: '0 2px 8px rgba(0,99,156,0.4)'
                            }}
                        >
                            <Camera size={16} />
                        </IconButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            hidden
                            onChange={handleAvatarChange}
                        />
                    </Box>
                    <Box>
                        <Typography fontWeight={700}>{user?.username}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{user?.role}</Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Camera size={15} />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ mt: 1.5, borderRadius: 8, textTransform: 'none', fontWeight: 700 }}
                        >
                            Ganti Foto
                        </Button>
                        <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                            JPG, PNG, WebP. Maks 2MB.
                        </Typography>
                    </Box>
                </Box>
            </Card>

            {/* Username Card */}
            <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1}>
                    <User size={20} /> Informasi Akun
                </Typography>
                <TextField
                    label="Username"
                    fullWidth
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <User size={18} color="#94a3b8" />
                            </InputAdornment>
                        )
                    }}
                    helperText="Username digunakan untuk login ke aplikasi"
                />
            </Card>

            {/* Password Card */}
            <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1}>
                    <Lock size={20} /> Ganti Password
                </Typography>
                <Box display="flex" flexDirection="column" gap={2.5}>
                    <TextField
                        label="Password Saat Ini"
                        type={showCurrent ? 'text' : 'password'}
                        fullWidth
                        value={currentPwd}
                        onChange={e => setCurrentPwd(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock size={18} color="#94a3b8" /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowCurrent(p => !p)} edge="end">
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        helperText="Wajib diisi jika ingin mengganti password"
                    />
                    <Divider />
                    <TextField
                        label="Password Baru"
                        type={showNew ? 'text' : 'password'}
                        fullWidth
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock size={18} color="#94a3b8" /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNew(p => !p)} edge="end">
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        helperText="Minimal 6 karakter"
                    />
                    <TextField
                        label="Konfirmasi Password Baru"
                        type={showConfirm ? 'text' : 'password'}
                        fullWidth
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        error={confirmPwd.length > 0 && confirmPwd !== newPwd}
                        helperText={confirmPwd.length > 0 && confirmPwd !== newPwd ? 'Password tidak cocok' : ''}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock size={18} color="#94a3b8" /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirm(p => !p)} edge="end">
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            </Card>

            {/* Save Button */}
            <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save size={20} />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                    borderRadius: '16px',
                    py: 1.8,
                    fontWeight: 800,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #00639C 0%, #1e3a8a 100%)',
                    boxShadow: '0 8px 24px rgba(0,99,156,0.3)',
                    '&:hover': { boxShadow: '0 12px 32px rgba(0,99,156,0.4)', transform: 'translateY(-1px)' },
                    transition: 'all 0.2s'
                }}
            >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnack(s => ({ ...s, open: false }))}
                    severity={snack.severity}
                    variant="filled"
                    icon={snack.severity === 'success' ? <CheckCircle size={18} /> : undefined}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Profile;
