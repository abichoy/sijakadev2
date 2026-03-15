import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab, Card, TextField, Select, MenuItem, FormControl, InputLabel, Grid, InputAdornment } from '@mui/material';
import { FileText, Download, Search, Filter } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Laporan = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [kepatuhan, setKepatuhan] = useState([]);
    const [nakhodas, setNakhodas] = useState([]);
    const [inventaris, setInventaris] = useState([]);

    // Tab 1 States
    const [searchKepa, setSearchKepa] = useState('');
    const [filterKepa, setFilterKepa] = useState('Semua');
    const [sortKepa, setSortKepa] = useState('Terbaru');

    // Tab 2 States
    const [searchNakhoda, setSearchNakhoda] = useState('');
    const [sortNakhoda, setSortNakhoda] = useState('Nama A-Z');

    // Tab 3 States
    const [searchInv, setSearchInv] = useState('');
    const [filterJenisInv, setFilterJenisInv] = useState('Semua');
    const [filterKondisiInv, setFilterKondisiInv] = useState('Semua');
    const [sortInv, setSortInv] = useState('Kode A-Z');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [resKepa, resNakh, resInv] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/peminjaman/aktif`, config).catch(() => ({data:{data:[]}})),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/nakhoda`, config).catch(() => ({data:{data:[]}})),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/inventaris`, config).catch(() => ({data:{data:[]}}))
                ]);

                if (resKepa.data.data) setKepatuhan(resKepa.data.data);
                if (resNakh.data.data) setNakhodas(resNakh.data.data);
                if (resInv.data.data) setInventaris(resInv.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChangeTab = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    // Data Processing with useMemo
    const processedKepatuhan = useMemo(() => {
        let data = [...kepatuhan];
        if (searchKepa) {
            data = data.filter(item => 
                item.Nakhoda?.nama_lengkap?.toLowerCase().includes(searchKepa.toLowerCase()) || 
                item.Kapal?.nama_kapal?.toLowerCase().includes(searchKepa.toLowerCase())
            );
        }
        if (filterKepa !== 'Semua') {
            data = data.filter(item => {
                const isOverdue = dayjs().isAfter(dayjs(item.batas_waktu));
                if (filterKepa === 'Terlambat') return isOverdue;
                if (filterKepa === 'Aman') return !isOverdue;
                return true;
            });
        }
        data.sort((a, b) => {
            if (sortKepa === 'Terbaru') return dayjs(b.waktu_checkout).valueOf() - dayjs(a.waktu_checkout).valueOf();
            if (sortKepa === 'Terlama') return dayjs(a.waktu_checkout).valueOf() - dayjs(b.waktu_checkout).valueOf();
            return 0;
        });
        return data;
    }, [kepatuhan, searchKepa, filterKepa, sortKepa]);

    const processedNakhodas = useMemo(() => {
        let data = [...nakhodas];
        if (searchNakhoda) {
            data = data.filter(item => 
                item.nama_lengkap?.toLowerCase().includes(searchNakhoda.toLowerCase()) || 
                item.Kapal?.nama_kapal?.toLowerCase().includes(searchNakhoda.toLowerCase())
            );
        }
        data.sort((a, b) => {
            if (sortNakhoda === 'Nama A-Z') return (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '');
            if (sortNakhoda === 'Nama Z-A') return (b.nama_lengkap || '').localeCompare(a.nama_lengkap || '');
            if (sortNakhoda === 'Kapasitas Terbesar') return (b.Kapal?.kapasitas_penumpang || 0) - (a.Kapal?.kapasitas_penumpang || 0);
            return 0;
        });
        return data;
    }, [nakhodas, searchNakhoda, sortNakhoda]);

    const processedInventaris = useMemo(() => {
        let data = [...inventaris];
        if (searchInv) {
            data = data.filter(item => 
                item.kode_jaket?.toLowerCase().includes(searchInv.toLowerCase()) || 
                item.lokasi_penyimpanan?.toLowerCase().includes(searchInv.toLowerCase())
            );
        }
        if (filterJenisInv !== 'Semua') {
            data = data.filter(item => item.jenis?.toLowerCase() === filterJenisInv.toLowerCase());
        }
        if (filterKondisiInv !== 'Semua') {
            data = data.filter(item => item.kondisi?.toLowerCase() === filterKondisiInv.toLowerCase());
        }
        data.sort((a, b) => {
            if (sortInv === 'Kode A-Z') return (a.kode_jaket || '').localeCompare(b.kode_jaket || '');
            if (sortInv === 'Kode Z-A') return (b.kode_jaket || '').localeCompare(a.kode_jaket || '');
            return 0;
        });
        return data;
    }, [inventaris, searchInv, filterJenisInv, filterKondisiInv, sortInv]);


    // Export Helpers
    const exportToPDF = (title, columns, data) => {
        try {
            const doc = new jsPDF();
            doc.text(title, 14, 22);
            autoTable(doc, {
                startY: 30,
                head: [columns],
                body: data,
            });
            doc.save(`${title.replace(/ /g, '_')}_${dayjs().format('YYYYMMDD')}.pdf`);
            // alert(`Berhasil mendownload PDF ${title}`);
        } catch (err) {
            console.error('PDF Export Error:', err);
            alert('Gagal Export PDF: ' + err.message);
        }
    };

    const exportToExcel = (title, json) => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(json);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
            XLSX.writeFile(workbook, `${title.replace(/ /g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`);
            // alert(`Berhasil mendownload Excel ${title}`);
        } catch (err) {
            console.error('Excel Export Error:', err);
            alert('Gagal Export Excel: ' + err.message);
        }
    };

    // Action Handlers for Exporting
    const handleExportKepatuhanPDF = () => {
        const cols = ['Waktu Pinjam', 'Nakhoda', 'Kapal', 'Jml Dewasa', 'Jml Anak', 'Status Batas Waktu'];
        const rows = processedKepatuhan.map(k => {
            const isOverdue = dayjs().isAfter(dayjs(k.batas_waktu));
            return [
                dayjs(k.waktu_checkout).format('DD MMM YYYY, HH:mm'),
                k.Nakhoda?.nama_lengkap || '-',
                k.Kapal?.nama_kapal || '-',
                k.jumlah_dewasa_dipinjam,
                k.jumlah_anak_dipinjam,
                isOverdue ? 'Terlambat' : 'Aman'
            ];
        });
        exportToPDF('Laporan Transaksi dan Kepatuhan', cols, rows);
    };

    const handleExportKepatuhanExcel = () => {
        const data = processedKepatuhan.map(k => {
            const isOverdue = dayjs().isAfter(dayjs(k.batas_waktu));
            return {
                'Waktu Pinjam': dayjs(k.waktu_checkout).format('DD MMM YYYY, HH:mm'),
                'Nakhoda': k.Nakhoda?.nama_lengkap || '-',
                'Kapal': k.Kapal?.nama_kapal || '-',
                'Jml Dewasa': k.jumlah_dewasa_dipinjam,
                'Jml Anak': k.jumlah_anak_dipinjam,
                'Status': isOverdue ? 'Terlambat' : 'Aman'
            };
        });
        exportToExcel('Laporan Transaksi_Kepatuhan', data);
    };

    const handleExportNakhodaPDF = () => {
        const cols = ['Nama Nakhoda', 'Kontak', 'Nama Kapal', 'Pemilik Kapal', 'Kapasitas (Orang)'];
        const rows = processedNakhodas.map(n => [
            n.nama_lengkap, n.kontak || '-', n.Kapal?.nama_kapal || '-', n.Kapal?.pemilik || '-', n.Kapal?.kapasitas_penumpang || '-'
        ]);
        exportToPDF('Laporan Data Kapal dan Nakhoda', cols, rows);
    };

    const handleExportNakhodaExcel = () => {
        const data = processedNakhodas.map(n => ({
            'Nama Nakhoda': n.nama_lengkap,
            'Kontak': n.kontak || '-',
            'Nama Kapal': n.Kapal?.nama_kapal || '-',
            'Pemilik Kapal': n.Kapal?.pemilik || '-',
            'Kapasitas (Orang)': n.Kapal?.kapasitas_penumpang || '-'
        }));
        exportToExcel('Laporan Data Kapal_Nakhoda', data);
    };

    const handleExportInventarisPDF = () => {
        const cols = ['Kode Jaket', 'Jenis', 'Kondisi', 'Lokasi Penyimpanan', 'Catatan Insiden'];
        const rows = processedInventaris.map(inv => [
            inv.kode_jaket, inv.jenis, inv.kondisi, inv.lokasi_penyimpanan || '-', inv.keterangan || inv.catatan_insiden || '-'
        ]);
        exportToPDF('Laporan Data Inventaris Jaket', cols, rows);
    };

    const handleExportInventarisExcel = () => {
        const data = processedInventaris.map(inv => ({
            'Kode Jaket': inv.kode_jaket,
            'Jenis': inv.jenis,
            'Kondisi': inv.kondisi,
            'Lokasi Penyimpanan': inv.lokasi_penyimpanan || '-',
            'Catatan Insiden': inv.keterangan || inv.catatan_insiden || '-'
        }));
        exportToExcel('Laporan Data Inventaris', data);
    };

    return (
        <Box>
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <FileText size={32} className="text-blue-600" />
                <Typography variant="h5" fontWeight="900" color="primary.main">Pusat Laporan & Rekapitulasi</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabIndex} onChange={handleChangeTab} aria-label="Laporan Tabs" textColor="primary" indicatorColor="primary">
                    <Tab label="1. Transaksi & Kepatuhan" sx={{ fontWeight: 'bold' }} />
                    <Tab label="2. Kapal & Nakhoda" sx={{ fontWeight: 'bold' }} />
                    <Tab label="3. Inventaris Jaket" sx={{ fontWeight: 'bold' }} />
                </Tabs>
            </Box>

            {/* TAB 1: Transaksi & Kepatuhan */}
            {tabIndex === 0 && (
                <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800" mb={1}>Laporan Transaksi & Kepatuhan</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Rekap data transaksi sirkulasi jaket yang saat ini masih dipinjam (Check-out Aktif).
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
                            <Button variant="outlined" color="error" startIcon={<Download size={16}/>} onClick={handleExportKepatuhanPDF} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Export PDF</Button>
                            <Button variant="contained" color="success" startIcon={<Download size={16}/>} onClick={handleExportKepatuhanExcel} sx={{ fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}>Export XLS</Button>
                        </Box>
                    </Box>

                    {/* Filter Bar Tab 1 */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField size="small" fullWidth label="Cari Nakhoda / Kapal" value={searchKepa} onChange={(e) => setSearchKepa(e.target.value)} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18}/></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Filter Status Waktu</InputLabel>
                                    <Select value={filterKepa} label="Filter Status Waktu" onChange={(e) => setFilterKepa(e.target.value)}>
                                        <MenuItem value="Semua">Semua Status</MenuItem>
                                        <MenuItem value="Aman">Aman (Sedang Berlayar)</MenuItem>
                                        <MenuItem value="Terlambat">Terlambat (&gt; 12 Jam)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Urutkan Berdasarkan</InputLabel>
                                    <Select value={sortKepa} label="Urutkan Berdasarkan" onChange={(e) => setSortKepa(e.target.value)}>
                                        <MenuItem value="Terbaru">Waktu Pinjam: Terbaru</MenuItem>
                                        <MenuItem value="Terlama">Waktu Pinjam: Terlama</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Waktu Pinjam</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nakhoda (Kapal)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Jml Dipinjam</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status Batas Waktu</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedKepatuhan.map((row) => {
                                    const isOverdue = dayjs().isAfter(dayjs(row.batas_waktu));
                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell>{dayjs(row.waktu_checkout).format('DD MMM YYYY, HH:mm')}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={800}>{row.Nakhoda?.nama_lengkap}</Typography>
                                                <Typography variant="caption" color="text.secondary">{row.Kapal?.nama_kapal}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.jumlah_dewasa_dipinjam} D, {row.jumlah_anak_dipinjam} A
                                            </TableCell>
                                            <TableCell>
                                                {isOverdue ? (
                                                    <Chip label="Terlambat (Lebih 12 Jam)" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                                                ) : (
                                                    <Chip label="Aman - Sedang Berlayar" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {processedKepatuhan.length === 0 && (
                                    <TableRow><TableCell colSpan={4} align="center">Tidak mendapati data yang sesuai.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {/* TAB 2: Kapal & Nakhoda */}
            {tabIndex === 1 && (
                <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800">Laporan Data Kapal dan Nakhoda</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Basis data armada dan nakhoda yang terdaftar di sistem.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
                            <Button variant="outlined" color="error" startIcon={<Download size={16}/>} onClick={handleExportNakhodaPDF} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Export PDF</Button>
                            <Button variant="contained" color="success" startIcon={<Download size={16}/>} onClick={handleExportNakhodaExcel} sx={{ fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}>Export XLS</Button>
                        </Box>
                    </Box>

                    {/* Filter Bar Tab 2 */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Cari Nakhoda / Kapal" value={searchNakhoda} onChange={(e) => setSearchNakhoda(e.target.value)} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18}/></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Urutkan Berdasarkan</InputLabel>
                                    <Select value={sortNakhoda} label="Urutkan Berdasarkan" onChange={(e) => setSortNakhoda(e.target.value)}>
                                        <MenuItem value="Nama A-Z">Nakhoda: A - Z</MenuItem>
                                        <MenuItem value="Nama Z-A">Nakhoda: Z - A</MenuItem>
                                        <MenuItem value="Kapasitas Terbesar">Kapasitas Kapal Terbesar</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nakhoda (Kontak)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Kapal (Pemilik)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Kapasitas</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedNakhodas.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={800}>{row.nama_lengkap}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.kontak || '-'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{row.Kapal?.nama_kapal || '-'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.Kapal?.pemilik || '-'}</Typography>
                                        </TableCell>
                                        <TableCell>{row.Kapal?.kapasitas_penumpang || '-'} Orang</TableCell>
                                    </TableRow>
                                ))}
                                {processedNakhodas.length === 0 && (
                                    <TableRow><TableCell colSpan={3} align="center">Belum ada data kapal & nakhoda terdaftar.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {/* TAB 3: Inventaris Jaket */}
            {tabIndex === 2 && (
                <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800">Laporan Data Inventaris Jaket</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Berisi Kode Jaket, Jenis, Kondisi, Lokasi, dan Keterangan Status.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
                            <Button variant="outlined" color="error" startIcon={<Download size={16}/>} onClick={handleExportInventarisPDF} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Export PDF</Button>
                            <Button variant="contained" color="success" startIcon={<Download size={16}/>} onClick={handleExportInventarisExcel} sx={{ fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}>Export XLS</Button>
                        </Box>
                    </Box>

                    {/* Filter Bar Tab 3 */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <TextField size="small" fullWidth label="Cari Kode Jaket/Lokasi" value={searchInv} onChange={(e) => setSearchInv(e.target.value)} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18}/></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Filter Jenis</InputLabel>
                                    <Select value={filterJenisInv} label="Filter Jenis" onChange={(e) => setFilterJenisInv(e.target.value)}>
                                        <MenuItem value="Semua">Semua Jenis</MenuItem>
                                        <MenuItem value="dewasa">Dewasa</MenuItem>
                                        <MenuItem value="anak">Anak</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Filter Kondisi</InputLabel>
                                    <Select value={filterKondisiInv} label="Filter Kondisi" onChange={(e) => setFilterKondisiInv(e.target.value)}>
                                        <MenuItem value="Semua">Semua Kondisi</MenuItem>
                                        <MenuItem value="baik">Sedia (Baik)</MenuItem>
                                        <MenuItem value="dipinjam">Sedang Dipinjam</MenuItem>
                                        <MenuItem value="rusak">Rusak / Hilang</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Urutkan Berdasarkan</InputLabel>
                                    <Select value={sortInv} label="Urutkan Berdasarkan" onChange={(e) => setSortInv(e.target.value)}>
                                        <MenuItem value="Kode A-Z">Kode Seri: A - Z</MenuItem>
                                        <MenuItem value="Kode Z-A">Kode Seri: Z - A</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Kode Seri</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Jenis</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Kondisi</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Catatan Insiden</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedInventaris.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{row.kode_jaket}</TableCell>
                                        <TableCell sx={{ textTransform: 'capitalize' }}>{row.jenis}</TableCell>
                                        <TableCell>
                                            <Chip label={row.kondisi} size="small" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }} 
                                                  color={row.kondisi === 'baik' ? 'success' : row.kondisi === 'dipinjam' ? 'primary' : 'error'} />
                                        </TableCell>
                                        <TableCell>{row.lokasi_penyimpanan || '-'}</TableCell>
                                        <TableCell>{row.keterangan || row.catatan_insiden || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {processedInventaris.length === 0 && (
                                    <TableRow><TableCell colSpan={5} align="center">Tidak mendapati inventaris yang sesuai kriteria.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

        </Box>
    );
};

export default Laporan;
