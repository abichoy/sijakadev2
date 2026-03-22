import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Ship, LayoutDashboard, SendToBack, BookOpen, Layers, BarChart, FileText, Search, Settings, Bell, Clock, X, Users, ShieldCheck } from 'lucide-react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, InputBase, Badge, Divider, Paper, CircularProgress, ClickAwayListener, Chip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const drawerWidth = 280;

const SearchBox = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 4,
    backgroundColor: alpha(theme.palette.common.black, 0.05),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.black, 0.08),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    transition: 'all 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '30ch',
        },
    },
}));

const MainLayout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} />, roles: ['petugas', 'admin'] },
        { name: 'Kapal', path: '/kapal', icon: <Ship size={22} />, roles: ['admin'] },
        { name: 'Nakhoda', path: '/nakhoda', icon: <Users size={22} />, roles: ['admin'] },
        { name: 'Inventaris', path: '/inventaris', icon: <Layers size={22} />, roles: ['admin', 'petugas'] },
        { name: 'Peminjaman', path: '/checkout', icon: <SendToBack size={22} />, roles: ['petugas', 'admin'] },
        { name: 'Laporan', path: '/laporan', icon: <BarChart size={22} />, roles: ['admin'] },
        { name: 'Edukasi', path: '/edukasi', icon: <BookOpen size={22} />, roles: ['petugas', 'admin'] },
        { name: 'Pengaturan', path: '/pengaturan', icon: <ShieldCheck size={22} />, roles: ['admin'] },
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

    const getPageTitle = () => {
        const currentItem = navItems.find(nav => location.pathname === nav.path || (nav.path !== '/' && location.pathname.startsWith(nav.path)));
        return currentItem ? currentItem.name : 'Halaman Utama';
    };

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // --- Notification State ---
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);

    const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/laporan/kepatuhan`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setNotifLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchSearch = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            try {
                const token = localStorage.getItem('token');
                const [kapalRes, nakhodaRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/kapal`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${import.meta.env.VITE_API_URL}/nakhoda`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const q = searchQuery.toLowerCase();
                const kapals = kapalRes.data.data
                    .filter(k => k.nama_kapal.toLowerCase().includes(q) || k.pemilik.toLowerCase().includes(q))
                    .map(k => ({ id: k.id_kapal, title: k.nama_kapal, subtitle: `Pemilik: ${k.pemilik}`, type: 'Kapal', path: '/kapal' }));

                const nakhodas = nakhodaRes.data.data
                    .filter(n => n.nama_lengkap.toLowerCase().includes(q))
                    .map(n => ({ id: n.id_nakhoda, title: n.nama_lengkap, subtitle: `Kontak: ${n.kontak || '-'}`, type: 'Nakhoda', path: '/nakhoda' }));

                setSearchResults([...kapals, ...nakhodas].slice(0, 6));
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleResultClick = (result) => {
        setShowResults(false);
        setSearchQuery('');
        navigate(result.path);
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }} className="shadow-2xl shadow-slate-300">
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #00639C 0%, #1e3a8a 100%)' }}>
                <Box className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow" />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold" color="white" sx={{ letterSpacing: 1 }}>SiJaka</Typography>
                    <Typography variant="caption" color="primary.light" sx={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1.5 }}>Maccini Baji</Typography>
                </Box>
            </Box>

            <List sx={{ flexGrow: 1, px: 2, pt: 3 }}>
                {filteredNav.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <ListItem
                            key={item.path}
                            component={Link}
                            to={item.path}
                            sx={{
                                mb: 1,
                                borderRadius: '16px',
                                background: isActive ? 'var(--color-primary-50)' : 'transparent',
                                color: isActive ? 'primary.main' : 'text.secondary',
                                '&:hover': {
                                    background: isActive ? 'var(--color-primary-50)' : '#f1f5f9',
                                    color: 'primary.main',
                                    transform: 'translateX(4px)',
                                },
                                transition: 'all 0.3s ease',
                                boxShadow: isActive ? '0 4px 12px rgba(0, 99, 156, 0.1)' : 'none',
                                border: isActive ? '1px solid rgba(0, 99, 156, 0.1)' : '1px solid transparent'
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.name}
                                primaryTypographyProps={{ fontWeight: isActive ? 800 : 600, fontSize: '0.95rem' }}
                            />
                        </ListItem>
                    );
                })}
            </List>

            <Divider />

            <Box sx={{ p: 3 }}>
                {/* Profile - navigate to settings */}
                <Box
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-100 group"
                    onClick={() => navigate('/profile')}
                    sx={{ mb: 1 }}
                >
                    <Avatar
                        src={user?.avatar_url || undefined}
                        sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}
                        className="shadow-md shadow-orange-200 group-hover:scale-110 transition-transform"
                    >
                        {!user?.avatar_url && user?.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flex={1} overflow="hidden">
                        <Typography variant="body2" fontWeight="800" color="text.primary" sx={{ textTransform: 'capitalize', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.username}</Typography>
                        <Typography variant="caption" fontWeight="bold" color="primary.main">Pengaturan Profil →</Typography>
                    </Box>
                </Box>
                {/* Logout */}
                <Box
                    className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-red-50 cursor-pointer transition-colors border border-transparent hover:border-red-100"
                    onClick={logout}
                >
                    <Typography variant="caption" fontWeight="bold" color="error.main" sx={{ ml: 1 }}>Keluar Aplikasi</Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { md: `calc(100% - ${drawerWidth}px)` }, position: 'relative' }}>
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)', color: 'text.primary' }}>
                    <Toolbar sx={{ minHeight: '80px !important' }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <img src="/logo.png" alt="Menu" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                        </IconButton>

                        <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 800 }}>
                            {getPageTitle()}
                        </Typography>

                        <ClickAwayListener onClickAway={() => setShowResults(false)}>
                            <Box sx={{ position: 'relative' }}>
                                <SearchBox sx={{ ml: { xs: 0, sm: 4 } }}>
                                    <SearchIconWrapper>
                                        <Search size={20} />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        placeholder="Cari Data Kapal atau Nakhoda..."
                                        inputProps={{ 'aria-label': 'search' }}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowResults(true);
                                        }}
                                        onFocus={() => { if (searchQuery.trim().length >= 2) setShowResults(true); }}
                                    />
                                </SearchBox>

                                {showResults && searchQuery.trim().length >= 2 && (
                                    <Paper
                                        elevation={8}
                                        sx={{
                                            position: 'absolute', top: '100%', left: { xs: 0, sm: 32 }, right: 0,
                                            mt: 1, maxHeight: 350, overflow: 'auto', borderRadius: 3, zIndex: 50,
                                            width: { xs: '100vw', sm: '350px' }
                                        }}
                                    >
                                        <List sx={{ p: 0 }}>
                                            {isSearching ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((result, idx) => (
                                                    <div key={result.id + idx}>
                                                        <ListItem
                                                            button
                                                            onClick={() => handleResultClick(result)}
                                                            sx={{ '&:hover': { bgcolor: 'primary.50' }, transition: 'all 0.2s' }}
                                                        >
                                                            <ListItemText
                                                                primary={result.title}
                                                                secondary={result.subtitle}
                                                                primaryTypographyProps={{ fontWeight: 'bold' }}
                                                            />
                                                            <Chip size="small" label={result.type} color={result.type === 'Kapal' ? 'primary' : 'secondary'} />
                                                        </ListItem>
                                                        {idx < searchResults.length - 1 && <Divider />}
                                                    </div>
                                                ))
                                            ) : (
                                                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                                    Data tidak ditemukan.
                                                </Box>
                                            )}
                                        </List>
                                    </Paper>
                                )}
                            </Box>
                        </ClickAwayListener>

                        <Box sx={{ flexGrow: 1 }} />

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box className="bg-white border text-blue-700 border-slate-200 shadow-sm rounded-full px-4 py-2 text-sm font-bold flex items-center space-x-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <span className="hidden sm:inline">Online</span>
                            </Box>

                            {/* Notification Button with Dropdown */}
                            <ClickAwayListener onClickAway={() => setShowNotif(false)}>
                                <Box sx={{ position: 'relative' }}>
                                    <IconButton
                                        id="notif-btn"
                                        onClick={() => setShowNotif(prev => !prev)}
                                        sx={{ bgcolor: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                                    >
                                        <Badge badgeContent={notifications.length} color="error" max={99}>
                                            <Bell size={20} className="text-slate-600" />
                                        </Badge>
                                    </IconButton>

                                    {showNotif && (
                                        <Paper
                                            elevation={10}
                                            sx={{
                                                position: 'absolute',
                                                top: 'calc(100% + 10px)',
                                                right: 0,
                                                width: 360,
                                                maxHeight: 480,
                                                borderRadius: 3,
                                                zIndex: 100,
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {/* Panel Header */}
                                            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: notifications.length > 0 ? 'error.main' : 'success.main', color: 'white' }}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Bell size={18} />
                                                    <Typography fontWeight={800} fontSize="0.95rem">Peringatan Kepatuhan</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {notifications.length > 0 && (
                                                        <Chip label={`${notifications.length} terlambat`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }} />
                                                    )}
                                                    <IconButton size="small" onClick={() => setShowNotif(false)} sx={{ color: 'white' }}>
                                                        <X size={16} />
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Panel Body */}
                                            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                                                {notifLoading ? (
                                                    <Box display="flex" justifyContent="center" p={4}>
                                                        <CircularProgress size={28} color="error" />
                                                    </Box>
                                                ) : notifications.length === 0 ? (
                                                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5} gap={1.5}>
                                                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'success.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <FileText size={28} color="#10b981" />
                                                        </Box>
                                                        <Typography fontWeight={700} color="text.primary" fontSize="0.9rem">Semua Aman!</Typography>
                                                        <Typography variant="caption" color="text.secondary" textAlign="center">Tidak ada peminjaman yang melewati batas waktu pengembalian.</Typography>
                                                    </Box>
                                                ) : (
                                                    <List sx={{ p: 0 }}>
                                                        {notifications.map((notif, idx) => (
                                                            <Box key={notif.id || idx}>
                                                                <ListItem
                                                                    sx={{
                                                                        py: 2, px: 3,
                                                                        alignItems: 'flex-start',
                                                                        gap: 1.5,
                                                                        '&:hover': { bgcolor: 'error.50' },
                                                                        transition: 'background 0.2s',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => { setShowNotif(false); navigate('/peminjaman'); }}
                                                                >
                                                                    <Box sx={{ width: 40, height: 40, minWidth: 40, borderRadius: '50%', bgcolor: 'error.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5 }}>
                                                                        <Clock size={18} color="#ef4444" />
                                                                    </Box>
                                                                    <Box flex={1}>
                                                                        <Typography variant="body2" fontWeight={800} color="text.primary">
                                                                            {notif.Nakhoda?.nama_lengkap || 'Nakhoda Tidak Diketahui'}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                                            Kapal: <b>{notif.Kapal?.nama_kapal || '-'}</b>
                                                                        </Typography>
                                                                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                                                            <Chip
                                                                                label="Terlambat Check-in"
                                                                                size="small"
                                                                                color="error"
                                                                                sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                                                                            />
                                                                            {notif.batas_waktu && (
                                                                                <Typography variant="caption" color="error.main" fontWeight={700}>
                                                                                    · Batas: {dayjs(notif.batas_waktu).format('DD/MM/YY HH:mm')}
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </ListItem>
                                                                {idx < notifications.length - 1 && <Divider />}
                                                            </Box>
                                                        ))}
                                                    </List>
                                                )}
                                            </Box>

                                            {/* Panel Footer */}
                                            <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', textAlign: 'center' }}>
                                                <Typography
                                                    variant="caption"
                                                    color="primary.main"
                                                    fontWeight={700}
                                                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                    onClick={() => { setShowNotif(false); navigate('/laporan'); }}
                                                >
                                                    Lihat Semua di Laporan →
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    )}
                                </Box>
                            </ClickAwayListener>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Content Area */}
                <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflow: 'auto' }} className="relative">
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    <Box className="max-w-7xl mx-auto relative z-10 animate-slide-up">
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
