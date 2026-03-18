import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab, Card, TextField, Select, MenuItem, FormControl, InputLabel, Grid, InputAdornment, TableSortLabel, TablePagination } from '@mui/material';
import { FileText, Download, Search, Filter, ClipboardList, History, Printer } from 'lucide-react';
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
    const [auditLogs, setAuditLogs] = useState([]);
    const [history, setHistory] = useState([]);

    // Tab 0: Riwayat (New)
    const [searchHistory, setSearchHistory] = useState('');
    const [sortHistoryField, setSortHistoryField] = useState('waktu_checkout');
    const [sortHistoryOrder, setSortHistoryOrder] = useState('desc');
    const [pageHistory, setPageHistory] = useState(0);
    const [rowsPerPageHistory, setRowsPerPageHistory] = useState(100);

    // Tab 1 States
    const [searchKepa, setSearchKepa] = useState('');
    const [filterKepa, setFilterKepa] = useState('Semua');
    const [sortKepaField, setSortKepaField] = useState('waktu_checkout');
    const [sortKepaOrder, setSortKepaOrder] = useState('desc');
    const [pageXKepa, setPageXKepa] = useState(0);
    const [rowsPerPageKepa, setRowsPerPageKepa] = useState(100);

    // Tab 2 States
    const [searchNakhoda, setSearchNakhoda] = useState('');
    const [sortNakhodaField, setSortNakhodaField] = useState('nama_lengkap');
    const [sortNakhodaOrder, setSortNakhodaOrder] = useState('asc');
    const [pageXNakhoda, setPageXNakhoda] = useState(0);
    const [rowsPerPageNakhoda, setRowsPerPageNakhoda] = useState(100);

    // Tab 3 States
    const [searchInv, setSearchInv] = useState('');
    const [filterJenisInv, setFilterJenisInv] = useState('Semua');
    const [filterKondisiInv, setFilterKondisiInv] = useState('Semua');
    const [sortInvField, setSortInvField] = useState('kode_jaket');
    const [sortInvOrder, setSortInvOrder] = useState('asc');
    const [pageXInv, setPageXInv] = useState(0);
    const [rowsPerPageInv, setRowsPerPageInv] = useState(100);

    // Tab 4 States
    const [searchLog, setSearchLog] = useState('');
    const [sortLogField, setSortLogField] = useState('timestamp');
    const [sortLogOrder, setSortLogOrder] = useState('desc');
    const [pageXLog, setPageXLog] = useState(0);
    const [rowsPerPageLog, setRowsPerPageLog] = useState(100);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [resKepa, resNakh, resInv, resLogs, resHist] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/peminjaman/aktif`, config).catch(() => ({data:{data:[]}})),
                    axios.get(`${import.meta.env.VITE_API_URL}/nakhoda`, config).catch(() => ({data:{data:[]}})),
                    axios.get(`${import.meta.env.VITE_API_URL}/inventaris`, config).catch(() => ({data:{data:[]}})),
                    axios.get(`${import.meta.env.VITE_API_URL}/audit-logs`, config).catch(() => ({data:{data:[]}})),
                    axios.get(`${import.meta.env.VITE_API_URL}/peminjaman/history`, config).catch(() => ({data:{data:[]}}))
                ]);

                if (resKepa.data.data) setKepatuhan(resKepa.data.data);
                if (resNakh.data.data) setNakhodas(resNakh.data.data);
                if (resInv.data.data) setInventaris(resInv.data.data);
                if (resLogs.data.data) setAuditLogs(resLogs.data.data);
                if (resHist.data.data) setHistory(resHist.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChangeTab = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    const handleRequestSort = (tab, property) => {
        if (tab === 0) {
            const isAsc = sortHistoryField === property && sortHistoryOrder === 'asc';
            setSortHistoryOrder(isAsc ? 'desc' : 'asc');
            setSortHistoryField(property);
        } else if (tab === 1) {
            const isAsc = sortKepaField === property && sortKepaOrder === 'asc';
            setSortKepaOrder(isAsc ? 'desc' : 'asc');
            setSortKepaField(property);
        } else if (tab === 2) {
            const isAsc = sortNakhodaField === property && sortNakhodaOrder === 'asc';
            setSortNakhodaOrder(isAsc ? 'desc' : 'asc');
            setSortNakhodaField(property);
        } else if (tab === 3) {
            const isAsc = sortInvField === property && sortInvOrder === 'asc';
            setSortInvOrder(isAsc ? 'desc' : 'asc');
            setSortInvField(property);
        } else if (tab === 4) {
            const isAsc = sortLogField === property && sortLogOrder === 'asc';
            setSortLogOrder(isAsc ? 'desc' : 'asc');
            setSortLogField(property);
        }
    };

    // Data Processing with useMemo
    const processedHistory = useMemo(() => {
        let data = [...history];
        if (searchHistory) {
            const q = searchHistory.toLowerCase();
            data = data.filter(item => 
                item.Nakhoda?.nama_lengkap?.toLowerCase().includes(q) || 
                item.Kapal?.nama_kapal?.toLowerCase().includes(q) ||
                item.status?.toLowerCase().includes(q)
            );
        }
        data.sort((a, b) => {
            let fieldA, fieldB;
            if (sortHistoryField === 'waktu_checkout') { fieldA = dayjs(a.waktu_checkout).valueOf(); fieldB = dayjs(b.waktu_checkout).valueOf(); }
            else if (sortHistoryField === 'waktu_checkin') { fieldA = dayjs(a.waktu_checkin || 0).valueOf(); fieldB = dayjs(b.waktu_checkin || 0).valueOf(); }
            else if (sortHistoryField === 'nakhoda') { fieldA = a.Nakhoda?.nama_lengkap || ''; fieldB = b.Nakhoda?.nama_lengkap || ''; }
            else if (sortHistoryField === 'status') { fieldA = a.status; fieldB = b.status; }
            if (sortHistoryOrder === 'asc') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        });
        return data;
    }, [history, searchHistory, sortHistoryField, sortHistoryOrder]);

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
            let fieldA = '';
            let fieldB = '';
            
            if (sortKepaField === 'waktu_checkout') {
                fieldA = dayjs(a.waktu_checkout).valueOf();
                fieldB = dayjs(b.waktu_checkout).valueOf();
            } else if (sortKepaField === 'nakhoda') {
                fieldA = a.Nakhoda?.nama_lengkap?.toLowerCase() || '';
                fieldB = b.Nakhoda?.nama_lengkap?.toLowerCase() || '';
            } else if (sortKepaField === 'jumlah') {
                fieldA = (a.jumlah_dewasa_dipinjam || 0) + (a.jumlah_anak_dipinjam || 0);
                fieldB = (b.jumlah_dewasa_dipinjam || 0) + (b.jumlah_anak_dipinjam || 0);
            } else if (sortKepaField === 'status') {
                fieldA = dayjs().isAfter(dayjs(a.batas_waktu)) ? 1 : 0;
                fieldB = dayjs().isAfter(dayjs(b.batas_waktu)) ? 1 : 0;
            }

            if (sortKepaOrder === 'asc') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        });
        return data;
    }, [kepatuhan, searchKepa, filterKepa, sortKepaField, sortKepaOrder]);

    const processedNakhodas = useMemo(() => {
        let data = [...nakhodas];
        if (searchNakhoda) {
            data = data.filter(item => 
                item.nama_lengkap?.toLowerCase().includes(searchNakhoda.toLowerCase()) || 
                item.Kapal?.nama_kapal?.toLowerCase().includes(searchNakhoda.toLowerCase())
            );
        }
        data.sort((a, b) => {
            let fieldA = '';
            let fieldB = '';

            if (sortNakhodaField === 'nama_lengkap') {
                fieldA = a.nama_lengkap?.toLowerCase() || '';
                fieldB = b.nama_lengkap?.toLowerCase() || '';
            } else if (sortNakhodaField === 'kapal') {
                fieldA = a.Kapal?.nama_kapal?.toLowerCase() || '';
                fieldB = b.Kapal?.nama_kapal?.toLowerCase() || '';
            } else if (sortNakhodaField === 'kapasitas') {
                fieldA = a.Kapal?.kapasitas_penumpang || 0;
                fieldB = b.Kapal?.kapasitas_penumpang || 0;
            }

            if (sortNakhodaOrder === 'asc') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        });
        return data;
    }, [nakhodas, searchNakhoda, sortNakhodaField, sortNakhodaOrder]);

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
            let fieldA = '';
            let fieldB = '';

            if (sortInvField === 'kode_jaket') {
                fieldA = a.kode_jaket?.toLowerCase() || '';
                fieldB = b.kode_jaket?.toLowerCase() || '';
            } else if (sortInvField === 'jenis') {
                fieldA = a.jenis?.toLowerCase() || '';
                fieldB = b.jenis?.toLowerCase() || '';
            } else if (sortInvField === 'kondisi') {
                fieldA = a.kondisi?.toLowerCase() || '';
                fieldB = b.kondisi?.toLowerCase() || '';
            } else if (sortInvField === 'lokasi') {
                fieldA = a.lokasi_penyimpanan?.toLowerCase() || '';
                fieldB = b.lokasi_penyimpanan?.toLowerCase() || '';
            }

            if (sortInvOrder === 'asc') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        });
        return data;
    }, [inventaris, searchInv, filterJenisInv, filterKondisiInv, sortInvField, sortInvOrder]);

    const processedAuditLogs = useMemo(() => {
        let data = [...auditLogs];
        if (searchLog) {
            const q = searchLog.toLowerCase();
            data = data.filter(log => 
                (log.username || '').toLowerCase().includes(q) ||
                (log.action || '').toLowerCase().includes(q) ||
                (log.detail || '').toLowerCase().includes(q) ||
                (log.target_label || '').toLowerCase().includes(q)
            );
        }
        data.sort((a, b) => {
            let fieldA = '';
            let fieldB = '';

            if (sortLogField === 'timestamp') {
                fieldA = dayjs(a.timestamp).valueOf();
                fieldB = dayjs(b.timestamp).valueOf();
            } else if (sortLogField === 'username') {
                fieldA = a.username?.toLowerCase() || '';
                fieldB = b.username?.toLowerCase() || '';
            } else if (sortLogField === 'action') {
                fieldA = a.action?.toLowerCase() || '';
                fieldB = b.action?.toLowerCase() || '';
            } else if (sortLogField === 'module') {
                fieldA = a.module?.toLowerCase() || '';
                fieldB = b.module?.toLowerCase() || '';
            }

            if (sortLogOrder === 'asc') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        });
        return data;
    }, [auditLogs, searchLog, sortLogField, sortLogOrder]);


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

    const handlePrint = () => {
        window.print();
    };

    return (
        <Box>
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        #print-area, #print-area * { visibility: visible; }
                        #print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
                        .no-print { display: none !important; }
                    }
                `}
            </style>
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <FileText size={32} className="text-blue-600" />
                <Typography variant="h5" fontWeight="900" color="primary.main">Pusat Laporan & Rekapitulasi</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabIndex} onChange={handleChangeTab} aria-label="Laporan Tabs" textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto">
                    <Tab label="1. Riwayat Transaksi" sx={{ fontWeight: 'bold' }} icon={<History size={16} />} iconPosition="start" />
                    <Tab label="2. Transaksi Aktif" sx={{ fontWeight: 'bold' }} />
                    <Tab label="3. Kapal & Nakhoda" sx={{ fontWeight: 'bold' }} />
                    <Tab label="4. Inventaris Jaket" sx={{ fontWeight: 'bold' }} />
                    <Tab label="5. Log Aktivitas" sx={{ fontWeight: 'bold' }} icon={<ClipboardList size={16} />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* TAB 0: Riwayat Transaksi */}
            {tabIndex === 0 && (
                <Card id="print-area" sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800" mb={1}>Riwayat Seluruh Transaksi</Typography>
                            <Typography variant="subtitle2" color="text.secondary">Daftar lengkap transaksi peminjaman dan pengembalian jaket.</Typography>
                        </Box>
                        <Box display="flex" gap={1} className="no-print">
                            <Button variant="outlined" color="primary" startIcon={<Printer size={16}/>} onClick={handlePrint} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Cetak Laporan</Button>
                            <Button variant="contained" color="success" startIcon={<Download size={16}/>} onClick={() => exportToExcel('Riwayat_Transaksi', processedHistory)} sx={{ fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}>Excel</Button>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }} className="no-print">
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Cari Nakhoda / Kapal / Status" value={searchHistory} onChange={(e) => setSearchHistory(e.target.value)} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18}/></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                                <TablePagination
                                    component="div"
                                    count={processedHistory.length}
                                    page={pageHistory}
                                    onPageChange={(e, newPage) => setPageHistory(newPage)}
                                    rowsPerPage={rowsPerPageHistory}
                                    onRowsPerPageChange={(e) => { setRowsPerPageHistory(parseInt(e.target.value, 10)); setPageHistory(0); }}
                                    rowsPerPageOptions={[10, 50, 100, 250]} labelRowsPerPage="Baris:" />
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortHistoryField === 'waktu_checkout'} direction={sortHistoryField === 'waktu_checkout' ? sortHistoryOrder : 'desc'} onClick={() => handleRequestSort(0, 'waktu_checkout')}>Pinjam</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortHistoryField === 'waktu_checkin'} direction={sortHistoryField === 'waktu_checkin' ? sortHistoryOrder : 'asc'} onClick={() => handleRequestSort(0, 'waktu_checkin')}>Kembali</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortHistoryField === 'nakhoda'} direction={sortHistoryField === 'nakhoda' ? sortHistoryOrder : 'asc'} onClick={() => handleRequestSort(0, 'nakhoda')}>Nakhoda (Kapal)</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortHistoryField === 'status'} direction={sortHistoryField === 'status' ? sortHistoryOrder : 'asc'} onClick={() => handleRequestSort(0, 'status')}>Status</TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedHistory.slice(pageHistory * rowsPerPageHistory, pageHistory * rowsPerPageHistory + rowsPerPageHistory).map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{dayjs(row.waktu_checkout).format('DD/MM/YY HH:mm')}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{row.waktu_checkin ? dayjs(row.waktu_checkin).format('DD/MM/YY HH:mm') : '-'}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} fontSize="0.85rem">{row.Nakhoda?.nama_lengkap}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.Kapal?.nama_kapal}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{row.jumlah_dewasa_dipinjam}D, {row.jumlah_anak_dipinjam}A</TableCell>
                                        <TableCell>
                                            <Chip label={row.status} size="small" variant="outlined" color={row.status === 'selesai' ? 'success' : 'primary'} sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {/* TAB 1: Transaksi & Kepatuhan */}
            {tabIndex === 1 && (
                <Card id="print-area" sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800" mb={1}>Laporan Transaksi & Kepatuhan</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Rekap data transaksi sirkulasi jaket yang saat ini masih dipinjam (Check-out Aktif).
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1} className="no-print">
                            <Button variant="outlined" color="primary" startIcon={<Printer size={16}/>} onClick={handlePrint} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Cetak Laporan</Button>
                            <Button variant="outlined" color="error" startIcon={<Download size={16}/>} onClick={handleExportKepatuhanPDF} sx={{ fontWeight: 'bold', borderRadius: 2 }}>PDF</Button>
                            <Button variant="contained" color="success" startIcon={<Download size={16}/>} onClick={handleExportKepatuhanExcel} sx={{ fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}>Excel</Button>
                        </Box>
                    </Box>

                    {/* Filter Bar Tab 1 */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
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
                                        <MenuItem value="Terlambat">Terlambat (&gt; 3 Hari)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4} display="flex" justifyContent="flex-end">
                                <TablePagination
                                    component="div"
                                    count={processedKepatuhan.length}
                                    page={pageXKepa}
                                    onPageChange={(e, newPage) => setPageXKepa(newPage)}
                                    rowsPerPage={rowsPerPageKepa}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPageKepa(parseInt(e.target.value, 10));
                                        setPageXKepa(0);
                                    }}
                                    rowsPerPageOptions={[10, 50, 100, 250]}
                                    labelRowsPerPage="Baris:"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortKepaField === 'waktu_checkout'} direction={sortKepaField === 'waktu_checkout' ? sortKepaOrder : 'desc'} onClick={() => handleRequestSort(1, 'waktu_checkout')}>
                                            Waktu Pinjam
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortKepaField === 'nakhoda'} direction={sortKepaField === 'nakhoda' ? sortKepaOrder : 'asc'} onClick={() => handleRequestSort(1, 'nakhoda')}>
                                            Nakhoda (Kapal)
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortKepaField === 'jumlah'} direction={sortKepaField === 'jumlah' ? sortKepaOrder : 'asc'} onClick={() => handleRequestSort(1, 'jumlah')}>
                                            Jml Dipinjam
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortKepaField === 'status'} direction={sortKepaField === 'status' ? sortKepaOrder : 'asc'} onClick={() => handleRequestSort(1, 'status')}>
                                            Status Batas Waktu
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedKepatuhan.slice(pageXKepa * rowsPerPageKepa, pageXKepa * rowsPerPageKepa + rowsPerPageKepa).map((row) => {
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
                                                    <Chip label="Terlambat (Lebih 3 Hari)" color="error" size="small" sx={{ fontWeight: 'bold' }} />
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
            {tabIndex === 2 && (
                <Card id="print-area" sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800">Laporan Data Kapal dan Nakhoda</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Basis data armada dan nakhoda yang terdaftar di sistem.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1} className="no-print">
                            <Button variant="outlined" color="primary" startIcon={<Printer size={16}/>} onClick={handlePrint} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Cetak Laporan</Button>
                            <Button variant="outlined" color="error" startIcon={<Download size={16}/>} onClick={handleExportNakhodaPDF} sx={{ fontWeight: 'bold', borderRadius: 2 }}>PDF</Button>
                            <Button variant="contained" color="success" startIcon={<Download size={16}/>} onClick={handleExportNakhodaExcel} sx={{ fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}>Excel</Button>
                        </Box>
                    </Box>

                    {/* Filter Bar Tab 2 */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Cari Nakhoda / Kapal" value={searchNakhoda} onChange={(e) => setSearchNakhoda(e.target.value)} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18}/></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                                <TablePagination
                                    component="div"
                                    count={processedNakhodas.length}
                                    page={pageXNakhoda}
                                    onPageChange={(e, newPage) => setPageXNakhoda(newPage)}
                                    rowsPerPage={rowsPerPageNakhoda}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPageNakhoda(parseInt(e.target.value, 10));
                                        setPageXNakhoda(0);
                                    }}
                                    rowsPerPageOptions={[10, 50, 100, 250]}
                                    labelRowsPerPage="Baris:"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortNakhodaField === 'nama_lengkap'} direction={sortNakhodaField === 'nama_lengkap' ? sortNakhodaOrder : 'asc'} onClick={() => handleRequestSort(2, 'nama_lengkap')}>
                                            Nakhoda (Kontak)
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortNakhodaField === 'kapal'} direction={sortNakhodaField === 'kapal' ? sortNakhodaOrder : 'asc'} onClick={() => handleRequestSort(2, 'kapal')}>
                                            Kapal (Pemilik)
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortNakhodaField === 'kapasitas'} direction={sortNakhodaField === 'kapasitas' ? sortNakhodaOrder : 'asc'} onClick={() => handleRequestSort(2, 'kapasitas')}>
                                            Kapasitas
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedNakhodas.slice(pageXNakhoda * rowsPerPageNakhoda, pageXNakhoda * rowsPerPageNakhoda + rowsPerPageNakhoda).map((row) => (
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
            {tabIndex === 3 && (
                <Card id="print-area" sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800">Laporan Data Inventaris Jaket</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Berisi Kode Jaket, Jenis, Kondisi, Lokasi, dan Keterangan Status.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1} className="no-print">
                            <Button variant="outlined" color="primary" startIcon={<Printer size={16}/>} onClick={handlePrint} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Cetak Laporan</Button>
                            <Button variant="outlined" color="error" startIcon={<Download size={16}/>} onClick={handleExportInventarisPDF} sx={{ fontWeight: 'bold', borderRadius: 2 }}>PDF</Button>
                            <Button variant="contained" color="success" startIcon={<Download size={16}/>} onClick={handleExportInventarisExcel} sx={{ fontWeight: 'bold', borderRadius: 2, boxShadow: 'none' }}>Excel</Button>
                        </Box>
                    </Box>

                    {/* Filter Bar Tab 3 */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField size="small" fullWidth label="Cari Kode Jaket/Lokasi" value={searchInv} onChange={(e) => setSearchInv(e.target.value)} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18}/></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Filter Jenis</InputLabel>
                                    <Select value={filterJenisInv} label="Filter Jenis" onChange={(e) => setFilterJenisInv(e.target.value)}>
                                        <MenuItem value="Semua">Semua Jenis</MenuItem>
                                        <MenuItem value="dewasa">Dewasa</MenuItem>
                                        <MenuItem value="anak">Anak</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
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
                            <Grid item xs={12} md={5} display="flex" justifyContent="flex-end">
                                <TablePagination
                                    component="div"
                                    count={processedInventaris.length}
                                    page={pageXInv}
                                    onPageChange={(e, newPage) => setPageXInv(newPage)}
                                    rowsPerPage={rowsPerPageInv}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPageInv(parseInt(e.target.value, 10));
                                        setPageXInv(0);
                                    }}
                                    rowsPerPageOptions={[10, 50, 100, 250]}
                                    labelRowsPerPage="Baris:"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortInvField === 'kode_jaket'} direction={sortInvField === 'kode_jaket' ? sortInvOrder : 'asc'} onClick={() => handleRequestSort(3, 'kode_jaket')}>
                                            Kode Seri
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortInvField === 'jenis'} direction={sortInvField === 'jenis' ? sortInvOrder : 'asc'} onClick={() => handleRequestSort(3, 'jenis')}>
                                            Jenis
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortInvField === 'kondisi'} direction={sortInvField === 'kondisi' ? sortInvOrder : 'asc'} onClick={() => handleRequestSort(3, 'kondisi')}>
                                            Kondisi
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortInvField === 'lokasi'} direction={sortInvField === 'lokasi' ? sortInvOrder : 'asc'} onClick={() => handleRequestSort(3, 'lokasi')}>
                                            Lokasi
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Catatan Insiden</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedInventaris.slice(pageXInv * rowsPerPageInv, pageXInv * rowsPerPageInv + rowsPerPageInv).map((row) => (
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

            {/* TAB 4: Log Aktivitas (Audit Log) */}
            {tabIndex === 4 && (
                <Card id="print-area" sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="800">Log Aktivitas Manajemen Kapal</Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Catatan audit seluruh aktivitas CRUD yang dilakukan oleh pengguna di modul Manajemen Data Kapal.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1} className="no-print">
                            <Button variant="outlined" color="primary" startIcon={<Printer size={16}/>} onClick={handlePrint} sx={{ fontWeight: 'bold', borderRadius: 2 }}>Cetak Laporan</Button>
                        </Box>
                    </Box>

                    {/* Search */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Cari User / Aksi / Keterangan" value={searchLog} onChange={(e) => setSearchLog(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18}/></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                                <TablePagination
                                    component="div"
                                    count={processedAuditLogs.length}
                                    page={pageXLog}
                                    onPageChange={(e, newPage) => setPageXLog(newPage)}
                                    rowsPerPage={rowsPerPageLog}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPageLog(parseInt(e.target.value, 10));
                                        setPageXLog(0);
                                    }}
                                    rowsPerPageOptions={[10, 50, 100, 250]}
                                    labelRowsPerPage="Baris:"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--color-primary-50)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortLogField === 'timestamp'} direction={sortLogField === 'timestamp' ? sortLogOrder : 'desc'} onClick={() => handleRequestSort(4, 'timestamp')}>
                                            Waktu
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortLogField === 'username'} direction={sortLogField === 'username' ? sortLogOrder : 'asc'} onClick={() => handleRequestSort(4, 'username')}>
                                            User
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortLogField === 'action'} direction={sortLogField === 'action' ? sortLogOrder : 'asc'} onClick={() => handleRequestSort(4, 'action')}>
                                            Aksi
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        <TableSortLabel active={sortLogField === 'module'} direction={sortLogField === 'module' ? sortLogOrder : 'asc'} onClick={() => handleRequestSort(4, 'module')}>
                                            Modul
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Keterangan</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedAuditLogs
                                    .slice(pageXLog * rowsPerPageLog, pageXLog * rowsPerPageLog + rowsPerPageLog)
                                    .map((log) => {
                                        const actionColor = {
                                            'CREATE': 'success',
                                            'UPDATE': 'primary',
                                            'DELETE': 'error',
                                            'DELETE_BLOCKED': 'warning'
                                        };
                                        const actionLabel = {
                                            'CREATE': 'Tambah',
                                            'UPDATE': 'Edit',
                                            'DELETE': 'Hapus',
                                            'DELETE_BLOCKED': 'Hapus Ditolak'
                                        };
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                    {dayjs(log.timestamp).format('DD MMM YYYY, HH:mm:ss')}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={800}>{log.username}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={actionLabel[log.action] || log.action} 
                                                        color={actionColor[log.action] || 'default'} 
                                                        size="small" 
                                                        sx={{ fontWeight: 'bold' }} 
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={log.module} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">{log.target_label || '-'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">{log.detail || '-'}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                }
                                {auditLogs.length === 0 && (
                                    <TableRow><TableCell colSpan={6} align="center">Belum ada log aktivitas tercatat.</TableCell></TableRow>
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
