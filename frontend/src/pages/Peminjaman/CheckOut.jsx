import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Card, Stepper, Step, StepLabel, Button, TextField, Grid, Snackbar, Alert, CircularProgress, Autocomplete, Divider, Paper, FormControlLabel, Checkbox } from '@mui/material';
import { Camera, QrCode, PenTool, CheckCircle, Package } from 'lucide-react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import JaketSelectorModal from './JaketSelectorModal';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { X, AlertTriangle } from 'lucide-react';

const ActiveLoanWarningDialog = ({ open, onClose, data }) => {
    if (!data) return null;
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{
                sx: { 
                    borderRadius: '24px', 
                    maxWidth: '450px',
                    width: '100%',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ 
                bgcolor: '#ef4444', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                px: 3,
                py: 2
            }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <AlertTriangle size={24} />
                    <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: 1 }}>PERHATIAN !</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <X size={24} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <Box mb={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, width: '140px', flexShrink: 0 }}>
                            Nama Kapal
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            : {data.Kapal?.nama_kapal}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, width: '140px', flexShrink: 0 }}>
                            Nama Nakhoda
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            : {data.Nakhoda?.nama_lengkap}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ 
                    bgcolor: '#fff5f5', 
                    borderRadius: '16px', 
                    p: 3, 
                    mb: 4, 
                    border: '1px solid #fee2e2',
                    textAlign: 'center'
                }}>
                    <Typography variant="caption" fontWeight="900" color="#ef4444" sx={{ letterSpacing: 1, display: 'block', mb: 2 }}>
                        JUMLAH JAKET YANG DIPINJAM:
                    </Typography>
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <Box flex={1}>
                            <Typography variant="h4" fontWeight="900" color="#ef4444">{data.jumlah_dewasa_dipinjam}</Typography>
                            <Typography variant="caption" fontWeight="800" color="text.secondary">DEWASA</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ mx: 2, height: '40px', alignSelf: 'center' }} />
                        <Box flex={1}>
                            <Typography variant="h4" fontWeight="900" color="#ef4444">{data.jumlah_anak_dipinjam}</Typography>
                            <Typography variant="caption" fontWeight="800" color="text.secondary">ANAK</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ 
                    bgcolor: '#f8fafc', 
                    borderRadius: '16px', 
                    p: 3, 
                    mb: 4, 
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                }}>
                    <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                        Masih <Typography component="span" fontWeight="900" color="#ef4444" sx={{ textDecoration: 'underline' }}>belum mengembalikan</Typography> jaket keselamatan (life jacket).
                    </Typography>
                    <Typography variant="body2" fontWeight="800" sx={{ mt: 1, fontStyle: 'italic', color: '#1e293b' }}>
                        Kembalikan dulu untuk dapat melakukan peminjaman lagi.
                    </Typography>
                </Box>

                <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={onClose}
                    sx={{ 
                        bgcolor: '#1e293b', 
                        '&:hover': { bgcolor: '#0f172a' },
                        borderRadius: '12px',
                        py: 1.8,
                        fontWeight: '900',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    MENGERTI
                </Button>
            </DialogContent>
        </Dialog>
    );
};

const komitmenHtml = `<p>Dalam rangka mewujudkan penyelenggaraan pelayaran yang aman, tertib, dan bertanggung jawab serta melindungi keselamatan jiwa seluruh penumpang kapal tradisional di wilayah perairan Kabupaten Pangkajene dan Kepulauan, saya yang bertanda tangan di bawah ini selaku <strong>Nakhoda Kapal</strong>, dengan penuh kesadaran, komitmen, dan rasa tanggung jawab menyatakan menerima amanah sebagai <strong>"Duta Keselamatan Pelayaran."</strong></p>
<p>Sehubungan dengan peminjaman <strong>Jaket Keselamatan (Life Jacket)</strong> pada hari ini, saya menyatakan komitmen dan kesanggupan untuk melaksanakan hal-hal sebagai berikut:</p>
<h3 style="font-size: 1.1rem; margin-top: 1.5rem;">1. Pengawasan Penuh</h3>
<p>Saya akan mendistribusikan serta memastikan bahwa <strong>seluruh penumpang kapal telah mengenakan jaket keselamatan sebelum kapal diberangkatkan dari dermaga</strong>, sebagai langkah awal dalam menjamin keselamatan selama pelayaran.</p>
<h3 style="font-size: 1.1rem; margin-top: 1.5rem;">2. Imbauan dan Edukasi Keselamatan</h3>
<p>Saya akan memberikan <strong>imbauan keselamatan kepada seluruh penumpang selama pelayaran</strong>, serta mengedukasi bahwa jaket keselamatan merupakan <strong>"Seragam Pelaut Hebat" dan atribut keselamatan yang patut dibanggakan</strong>, sebagai simbol kesiapsiagaan dalam menjaga keselamatan bersama, dan bukan sebagai pertanda buruk (<em>pammali</em>).</p>
<h3 style="font-size: 1.1rem; margin-top: 1.5rem;">3. Kedisiplinan Pemakaian</h3>
<p>Saya tidak akan memperkenankan penumpang untuk <strong>melepas jaket keselamatan selama pelayaran berlangsung hingga kapal bersandar di pelabuhan tujuan</strong>, kecuali dalam kondisi tertentu yang dinilai aman dan tetap berada dalam pengawasan saya sebagai nakhoda kapal.</p>
<h3 style="font-size: 1.1rem; margin-top: 1.5rem;">4. Tanggung Jawab atas Perlengkapan Keselamatan</h3>
<p>Saya bertindak sebagai <strong>penanggung jawab penuh atas keutuhan dan pengembalian jaket keselamatan</strong> yang dipinjamkan. Saya berkomitmen untuk mengumpulkan kembali seluruh jaket keselamatan dari penumpang dan <strong>mengembalikannya kepada Petugas Stasiun/Dermaga segera setelah pelayaran selesai.</strong></p>
<h3 style="font-size: 1.1rem; margin-top: 1.5rem;">5. Kepatuhan terhadap Ketentuan</h3>
<p>Apabila saya dengan sengaja <strong>tidak mengembalikan, menghilangkan, atau lalai dalam melaksanakan tanggung jawab keselamatan ini secara berulang</strong>, maka saya bersedia menerima <strong>sanksi administratif sesuai ketentuan yang berlaku</strong>, mulai dari peringatan hingga peninjauan kembali izin operasional pelayaran kapal saya di dermaga pangkalan.</p>
<hr style="margin: 2rem 0;">
<p>Demikian <strong>Pakta Integritas</strong> ini saya buat dengan sebenar-benarnya, penuh kesadaran dan tanggung jawab, sebagai wujud komitmen saya sebagai pelaut yang menjunjung tinggi <strong>keselamatan jiwa manusia di laut</strong>.</p>`;

const CheckOut = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [allNakhoda, setAllNakhoda] = useState([]);
    const [selectedManualNakhoda, setSelectedManualNakhoda] = useState(null);
    const [nakhodaData, setNakhodaData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [activeLoanWarning, setActiveLoanWarning] = useState({ open: false, data: null });
    const [agreed, setAgreed] = useState(false);
    
    // Checkout form state (Arrays of UUIDs)
    const [form, setForm] = useState({ jaket_dewasa_ids: [], jaket_anak_ids: [] });
    // Modal states
    const [modalData, setModalData] = useState({ open: false, type: 'Dewasa', max: 0 });
    
    const isProcessingRef = useRef(false);
    const isInitializingRef = useRef(false);

    const steps = ['Pindai Kartu', 'Verifikasi Kuota', 'Pakta Integritas & Konfirmasi'];

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const fetchAllNakhoda = async () => {
        try {
            const token = localStorage.getItem('token');
            const [nakhodaRes, aktifRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/nakhoda`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/peminjaman/aktif`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (nakhodaRes.data.success && aktifRes.data.success) {
                const activeLoans = aktifRes.data.data;
                // Only show nakhoda/kapal who DON'T have an active loan yet
                const filtered = nakhodaRes.data.data.filter(nakhoda => {
                    return !activeLoans.some(l => 
                        l.nakhoda_id === nakhoda.id || 
                        l.kapal_id === nakhoda.kapal_id
                    );
                });
                setAllNakhoda(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch data for check-out nakhoda list:', error);
        }
    };

    useEffect(() => {
        fetchAllNakhoda();
    }, []);

    const scannerRef = useRef(null);
    const startScannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                // Check if it's currently scanning before stopping
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                // Always clear the inner HTML to remove video/canvas residues
                await scannerRef.current.clear();
                scannerRef.current = null;
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
                // Force cleanup even on error
                const container = document.getElementById("qr-reader");
                if (container) container.innerHTML = '';
                scannerRef.current = null;
                setIsScanning(false);
            }
        }
    }, []);

    const handleScanSuccess = useCallback(async (scannedQrId) => {
        if (isProcessingRef.current || activeStep !== 0) return;
        isProcessingRef.current = true;
        
        await stopScanner();
        setLoading(true);
        try {
            const aktifRes = await axios.get(`${import.meta.env.VITE_API_URL}/peminjaman/aktif`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const activeLoans = aktifRes.data.data;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/nakhoda/by-qr/${scannedQrId}`);
            if (res?.data?.success) {
                const nakhoda = res.data.data;
                const hasActiveLoan = activeLoans.find(l => 
                    l.nakhoda_id === nakhoda.id || 
                    l.kapal_id === nakhoda.kapal_id
                );

                if (hasActiveLoan) {
                    setActiveLoanWarning({ open: true, data: hasActiveLoan });
                    setLoading(false);
                    if (startScannerRef.current) startScannerRef.current(); 
                    return;
                }

                setNakhodaData(nakhoda);
                handleNext();
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Data Nakhoda berdasarkan QR tidak ditemukan.');
            if (startScannerRef.current) startScannerRef.current(); 
        } finally {
            setLoading(false);
            isProcessingRef.current = false;
        }
    }, [stopScanner, activeStep]); // Added activeStep dependency for the guard

    const startScanner = useCallback(async () => {
        if (scannerRef.current || isInitializingRef.current) return; 
        isInitializingRef.current = true;

        // Ensure the DOM element exists before starting
        const container = document.getElementById("qr-reader");
        if (!container) {
            isInitializingRef.current = false;
            return;
        }

        // Clean up any residual video elements in the container
        container.innerHTML = '';

        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = html5QrCode;
            
            await html5QrCode.start(
                { facingMode: "environment" }, 
                {
                    fps: 25, 
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
                        return { width: size, height: size };
                    },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                () => { /* silent scan failure */ }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Unable to start scanning", err);
            setIsScanning(false);
            if (scannerRef.current) {
                try {
                    await scannerRef.current.clear();
                } catch {
                    // Failing to clear is acceptable if it wasn't started
                }
                scannerRef.current = null;
            }
            container.innerHTML = '';
        } finally {
            isInitializingRef.current = false;
        }
    }, [handleScanSuccess]);

    useEffect(() => {
        if (activeStep === 0) {
            startScanner();
        } else {
            stopScanner();
        }
        
        return () => {
            stopScanner();
        };
    }, [activeStep, startScanner, stopScanner]);

    useEffect(() => {
        startScannerRef.current = startScanner;
    }, [startScanner]);

    // Removal of redundant handleScanSuccess since it's now defined above within useCallback

    const handleProceedManual = async () => {
        if (!selectedManualNakhoda) {
            setErrorMsg('Silakan pilih Nakhoda atau Kapal terlebih dahulu.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const aktifRes = await axios.get(`${import.meta.env.VITE_API_URL}/peminjaman/aktif`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const activeLoans = aktifRes.data.data;

            const hasActiveLoan = activeLoans.find(l => 
                l.nakhoda_id === selectedManualNakhoda.id || 
                l.kapal_id === selectedManualNakhoda.kapal_id
            );

            if (hasActiveLoan) {
                setActiveLoanWarning({ open: true, data: hasActiveLoan });
                return;
            }

            setNakhodaData(selectedManualNakhoda);
            handleNext();
        } catch (error) {
            console.error('Check active loan error:', error);
            setErrorMsg('Gagal memeriksa status peminjaman aktif.');
        } finally {
            setLoading(false);
        }
    };

    const handleHitungKuota = () => {
        const d = form.jaket_dewasa_ids.length;
        const a = form.jaket_anak_ids.length;
        if (d === 0 && a === 0) return setErrorMsg('Pilih minimal satu jaket untuk dipinjam.');

        handleNext();
    };

    const handleOpenModal = (type) => {
        if (!nakhodaData?.Kapal) return;
        
        const maks = type === 'Dewasa' 
            ? Math.ceil(nakhodaData.Kapal.kapasitas_penumpang * 1.25) 
            : Math.ceil(nakhodaData.Kapal.kapasitas_penumpang * 0.10);
            
        setModalData({ open: true, type, max: maks });
    };

    const handleSaveSelection = (selectedIds) => {
        if (modalData.type === 'Dewasa') {
            setForm({ ...form, jaket_dewasa_ids: selectedIds });
        } else {
            setForm({ ...form, jaket_anak_ids: selectedIds });
        }
        setModalData({ ...modalData, open: false });
    };

    const handleSubmitCheckout = async () => {
        if (!agreed) {
            return setErrorMsg('Anda harus menyetujui Pakta Integritas sebelum melanjutkan.');
        }
        setLoading(true);

        try {
            const payload = {
                nakhoda_id: nakhodaData.id,
                kapal_id: nakhodaData?.Kapal?.id,
                jaket_dewasa_ids: form.jaket_dewasa_ids,
                jaket_anak_ids: form.jaket_anak_ids,
                ttd_digital: null // Signature removed per request
            };

            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/peminjaman/checkout`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setSuccessMsg('Peminjaman Berhasil! Data telah tersimpan.');
                setTimeout(() => {
                    window.location.reload(); 
                }, 2000);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setErrorMsg(error.response?.data?.message || error.message || 'Error saat peminjaman');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel StepIconProps={{ sx: { 
                            '&.Mui-active': { color: 'primary.main' }, 
                            '&.Mui-completed': { color: 'success.main' }
                        }}}>
                            <Typography fontWeight={activeStep >= steps.indexOf(label) ? 800 : 500}>{label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                {/* Step 1: Scan QR */}
                {activeStep === 0 && (
                    <Box textAlign="center" maxWidth={500} mx="auto">
                        <Box sx={{
                            width: '100%', mb: 4, 
                            border: '4px dashed', borderColor: 'primary.light', 
                            borderRadius: '24px', overflow: 'hidden',
                            bgcolor: 'rgba(0,99,156,0.05)', position: 'relative'
                        }}>
                            <div id="qr-reader" style={{ width: '100%', minHeight: 400, border: 'none' }}></div>
                            
                            {/* Scanning Overlay Custom */}
                            {!loading && isScanning && (
                                <Box sx={{ 
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                    pointerEvents: 'none', display: 'flex', flexDirection: 'column', 
                                    alignItems: 'center', justifyContent: 'center' 
                                }}>
                                    <Box sx={{ 
                                        width: 260, height: 260, 
                                        border: '2px solid rgba(249, 115, 22, 0.5)', 
                                        borderRadius: '20px',
                                        boxShadow: '0 0 0 1000px rgba(0,0,0,0.3)',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""', position: 'absolute', top: -10, left: -10, width: 40, height: 40, borderLeft: '4px solid #f97316', borderTop: '4px solid #f97316'
                                        },
                                        '&::after': {
                                            content: '""', position: 'absolute', bottom: -10, right: -10, width: 40, height: 40, borderRight: '4px solid #f97316', borderBottom: '4px solid #f97316'
                                        }
                                    }}>
                                        <Box sx={{ 
                                            position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', 
                                            bgcolor: '#f97316', boxShadow: '0 0 15px #f97316',
                                            animation: 'scan 2s infinite ease-in-out'
                                        }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ mt: 4, color: 'white', fontWeight: 'bold', bgcolor: 'rgba(0,0,0,0.6)', px: 2, py: 1, borderRadius: 2 }}>
                                        Posisikan QR Code di Dalam Kotak
                                    </Typography>

                                    <style>{`
                                        @keyframes scan {
                                            0%, 100% { transform: translateY(-110px); }
                                            50% { transform: translateY(110px); }
                                        }
                                        #qr-reader video { object-fit: cover !important; }
                                        #qr-reader img { display: none !important; }
                                        #qr-reader__dashboard { display: none !important; }
                                    `}</style>
                                </Box>
                            )}
                            
                            {loading && (
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                    <CircularProgress size={60} thickness={5} />
                                </Box>
                            )}
                        </Box>

                        <Typography variant="overline" color="text.secondary" fontWeight="bold">ATAU PENCARIAN MANUAL</Typography>
                        <Autocomplete
                            options={allNakhoda}
                            getOptionLabel={(option) => `${option.nama_lengkap} (Kapal: ${option.Kapal?.nama_kapal || '-'})`}
                            value={selectedManualNakhoda}
                            onChange={(event, newValue) => {
                                setSelectedManualNakhoda(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} label="Cari Nama Nakhoda atau Kapal" variant="outlined" sx={{ mt: 2, mb: 3 }} />}
                        />
                        <Button 
                            variant="contained" 
                            size="large" 
                            onClick={handleProceedManual}
                            disabled={loading || !selectedManualNakhoda}
                            startIcon={<CheckCircle />}
                            sx={{ borderRadius: '16px', py: 1.5, px: 4, fontWeight: 'bold' }}
                            fullWidth
                        >
                            Lanjutkan Transaksi
                        </Button>
                    </Box>
                )}

                {/* Step 2: Input Kuota */}
                {activeStep === 1 && nakhodaData && (
                    <Box>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Box p={3} bgcolor="primary.50" borderRadius={4} height="100%" border="1px solid" borderColor="primary.100">
                                    <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing={1}>Data Nakhoda</Typography>
                                    <Typography variant="h5" fontWeight={900} mt={1}>{nakhodaData.nama_lengkap}</Typography>
                                    <Box display="flex" justifyContent="space-between" mt={3} borderTop="1px solid" borderColor="primary.200" pt={2}>
                                        <Typography variant="body2" color="text.secondary">Kapal Pengecas</Typography>
                                        <Typography variant="body2" fontWeight={800}>{nakhodaData.Kapal?.nama_kapal}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mt={1}>
                                        <Typography variant="body2" color="text.secondary">Kapasitas Maks.</Typography>
                                        <Typography variant="body2" fontWeight={800} color="secondary.main">{nakhodaData.Kapal?.kapasitas_penumpang} Penumpang</Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" fontWeight={800} mb={3}>Input Peminjaman Baru</Typography>
                                
                                <Card variant="outlined" sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, borderColor: form.jaket_dewasa_ids.length > 0 ? 'primary.main' : 'divider' }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box p={1.5} bgcolor="primary.50" borderRadius="50%" color="primary.main"><Package size={24}/></Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">Jaket Dewasa</Typography>
                                             <Typography variant="body2" color="text.secondary">Terpilih: <b>{form.jaket_dewasa_ids.length}</b> / {Math.ceil((nakhodaData?.Kapal?.kapasitas_penumpang || 0) * 1.25)} (Maks Kuota)</Typography>
                                         </Box>
                                     </Box>
                                     <Button variant="contained" onClick={() => handleOpenModal('Dewasa')} sx={{ borderRadius: 10, px: 3, py: 1 }} color={form.jaket_dewasa_ids.length > 0 ? "success" : "primary"}>
                                         {form.jaket_dewasa_ids.length > 0 ? <><CheckCircle size={18} style={{marginRight:8}}/>Ubah Pilihan</> : 'Pilih Jaket'}
                                     </Button>
                                 </Card>
 
                                 <Card variant="outlined" sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, borderColor: form.jaket_anak_ids.length > 0 ? 'secondary.main' : 'divider' }}>
                                     <Box display="flex" alignItems="center" gap={2}>
                                         <Box p={1.5} bgcolor="secondary.50" borderRadius="50%" color="secondary.main"><Package size={24}/></Box>
                                         <Box>
                                             <Typography variant="subtitle1" fontWeight="bold">Jaket Anak</Typography>
                                             <Typography variant="body2" color="text.secondary">Terpilih: <b>{form.jaket_anak_ids.length}</b> / {Math.ceil((nakhodaData?.Kapal?.kapasitas_penumpang || 0) * 0.10)} (Maks Kuota)</Typography>
                                        </Box>
                                    </Box>
                                    <Button variant="contained" onClick={() => handleOpenModal('Anak')} sx={{ borderRadius: 10, px: 3, py: 1 }} color={form.jaket_anak_ids.length > 0 ? "success" : "secondary"}>
                                        {form.jaket_anak_ids.length > 0 ? <><CheckCircle size={18} style={{marginRight:8}}/>Ubah Pilihan</> : 'Pilih Jaket'}
                                    </Button>
                                </Card>

                                <Box display="flex" gap={2}>
                                    <Button variant="outlined" onClick={handleBack} fullWidth sx={{ borderRadius: 3, fontWeight: 'bold' }}>Kembali</Button>
                                    <Button variant="contained" onClick={handleHitungKuota} fullWidth sx={{ borderRadius: 3, fontWeight: 'bold' }}>Hitung & Lanjut</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Step 3: Signature */}
                {activeStep === 2 && (
                    <Box textAlign="center">
                        <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 4, bgcolor: '#fff', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, bgcolor: 'primary.main' }} />
                            
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                                <Box>
                                    <Typography variant="h5" fontWeight={900} letterSpacing={-0.5} gutterBottom>PAKTA INTEGRITAS NAKHODA</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Peminjaman dan Penggunaan Jaket Keselamatan</Typography>
                                </Box>
                                <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, opacity: 0.8 }} />
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary', mb: 3 }}>
                                Saya yang bertanda tangan di bawah ini, <strong>{nakhodaData?.nama_lengkap}</strong>, selaku Nakhoda dari Kapal <strong>{nakhodaData?.Kapal?.nama_kapal}</strong>, dengan ini menyatakan telah menerima pinjaman peralatan keselamatan berupa:
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 4, mb: 4, bgcolor: 'primary.50', p: 2, borderRadius: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="primary.main" fontWeight="extrabold">JAKET DEWASA</Typography>
                                    <Typography variant="h6" fontWeight={900}>{form.jaket_dewasa_ids.length} Unit</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box>
                                    <Typography variant="caption" color="secondary.main" fontWeight="extrabold">JAKET ANAK</Typography>
                                    <Typography variant="h6" fontWeight={900}>{form.jaket_anak_ids.length} Unit</Typography>
                                </Box>
                            </Box>

                            <Typography component="div" variant="body2" sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, color: 'text.secondary', fontStyle: 'italic', bgcolor: 'grey.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Box dangerouslySetInnerHTML={{ __html: komitmenHtml }} />
                            </Typography>
                        </Paper>

                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        checked={agreed} 
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        color="primary"
                                        size="large"
                                    />
                                }
                                label={<Typography variant="h6" fontWeight="bold">SAYA MENYETUJUI</Typography>}
                            />
                        </Box>

                        <Box display="flex" gap={2} justifyContent="center" mt={2}>
                            <Button variant="outlined" size="large" onClick={handleBack} sx={{ borderRadius: '16px', px: 6, fontWeight: 'bold', minWidth: 160 }}>Kembali</Button>
                            <Button variant="contained" size="large" color="success" onClick={handleSubmitCheckout} disabled={loading || !agreed} sx={{ borderRadius: '16px', px: 6, py: 2, fontWeight: '900', fontSize: '1.2rem', minWidth: 240, boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)' }}>
                                {loading ? 'Memproses...' : 'KONFIRMASI PEMINJAMAN'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Card>

            <Snackbar open={!!errorMsg} autoHideDuration={6000} onClose={() => setErrorMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setErrorMsg('')} severity="error" sx={{ width: '100%', borderRadius: 2, fontWeight: 'bold' }} variant="filled">
                    {errorMsg}
                </Alert>
            </Snackbar>

            <Snackbar open={!!successMsg} autoHideDuration={2000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" sx={{ width: '100%', borderRadius: 3, fontWeight: '900', boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)' }} variant="filled">
                    {successMsg}
                </Alert>
            </Snackbar>

            <JaketSelectorModal 
                open={modalData.open} 
                onClose={() => setModalData({...modalData, open: false})}
                onSave={handleSaveSelection}
                maxLimit={modalData.max}
                typeLabel={modalData.type}
                preSelected={modalData.type === 'Dewasa' ? form.jaket_dewasa_ids : form.jaket_anak_ids}
            />

            <ActiveLoanWarningDialog 
                open={activeLoanWarning.open} 
                onClose={() => setActiveLoanWarning({ open: false, data: null })}
                data={activeLoanWarning.data}
            />
        </Box>
    );
};

export default CheckOut;
