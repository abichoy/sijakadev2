import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Card, Stepper, Step, StepLabel, Button, TextField, Grid, Snackbar, Alert, CircularProgress, Autocomplete } from '@mui/material';
import { Camera, QrCode, PenTool, CheckCircle, Package } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import JaketSelectorModal from './JaketSelectorModal';

const komitmenHtml = `<hr>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><br></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Dalam rangka mewujudkan pelayaran yang aman dan melindungi nyawa seluruh penumpang kapal tradisional di perairan Kabupaten Pangkajene dan Kepulauan, saya selaku Nakhoda secara sadar dan penuh kebanggaan menerima amanah sebagai <strong>&quot;Duta Keselamatan&quot;.</strong></span></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Berkenaan dengan peminjaman Jaket Keselamatan pada hari ini, saya menyatakan komitmen sebagai berikut:</span></p>
<div style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'>
    <ol style="margin-bottom:0cm;list-style-type: decimal;">
        <li style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'><strong><span style='font-family:"Arial",sans-serif;'>Pengawasan Penuh</span></strong></li>
    </ol>
</div>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:0cm;margin-left:36.0pt;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Saya akan mendistribusikan dan memastikan seluruh penumpang kapal memakai jaket keselamatan sebelum kapal diberangkatkan dari dermaga;</span></p>
<div style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'>
    <ol start="2" style="margin-bottom:0cm;list-style-type: decimal;">
        <li style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'><strong><span style='font-family:"Arial",sans-serif;'>Imbauan Keselamatan (Edukasi Lokal)</span></strong></li>
    </ol>
</div>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:0cm;margin-left:36.0pt;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Saya akan memberikan imbauan keselamatan kepada penumpang selama pelayaran, serta mengedukasi penumpang bahwa jaket ini adalah &quot;Seragam Pelaut Hebat&quot; dan &quot;Atribut Keselamatan&quot; yang patut dibanggakan demi menjaga keselamatan bersama, bukan sebagai pertanda buruk (pammali);</span></p>
<div style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'>
    <ol start="3" style="margin-bottom:0cm;list-style-type: decimal;">
        <li style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'><strong><span style='font-family:"Arial",sans-serif;'>Kedisiplinan Pemakaian</span></strong></li>
    </ol>
</div>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:0cm;margin-left:36.0pt;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Saya tidak memperkenankan penumpang untuk melepas jaket keselamatan selama pelayaran berlangsung sampai kapal bersandar di pelabuhan tujuan, kecuali dalam kondisi tertentu yang dinilai aman dan tetap berada di bawah pengawasan saya selaku nakhoda kapal;</span></p>
<div style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'>
    <ol start="4" style="margin-bottom:0cm;list-style-type: decimal;">
        <li style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'><strong><span style='font-family:"Arial",sans-serif;'>Menjaga Jaket Keselamatan</span></strong></li>
    </ol>
</div>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:0cm;margin-left:36.0pt;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Saya bertindak sebagai penanggung jawab tunggal atas keutuhan jaket keselamatan ini. Saya berkomitmen untuk mengumpulkan kembali seluruh jaket dari penumpang dan mengembalikannya kepada Petugas Stasiun/Dermaga segera setelah pelayaran selesai;</span></p>
<div style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'>
    <ol start="5" style="margin-bottom:0cm;list-style-type: decimal;">
        <li style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;'><strong><span style='font-family:"Arial",sans-serif;'>Kepatuhan Hukum</span></strong></li>
    </ol>
</div>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:36.0pt;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Apabila saya dengan sengaja tidak mengembalikan, menghilangkan, atau melalaikan tanggung jawab keselamatan ini secara berulang, saya bersedia menerima sanksi administratif berupa peringatan hingga peninjauan kembali izin operasional pelayaran kapal saya di dermaga pangkalan.</span></p>
<p style='margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;font-size:16px;font-family:"Calibri",sans-serif;text-align:justify;'><span style='font-family:"Arial",sans-serif;'>Demikian surat pernyataan ini saya buat dengan penuh rasa tanggung jawab sebagai pelaut yang menjunjung tinggi keselamatan jiwa manusia di laut.</span></p>`;

const CheckOut = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [allNakhoda, setAllNakhoda] = useState([]);
    const [selectedManualNakhoda, setSelectedManualNakhoda] = useState(null);
    const [nakhodaData, setNakhodaData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Checkout form state (Arrays of UUIDs)
    const [form, setForm] = useState({ jaket_dewasa_ids: [], jaket_anak_ids: [] });
    // Modal states
    const [modalData, setModalData] = useState({ open: false, type: 'Dewasa', max: 0 });
    
    const sigPad = useRef({});

    const steps = ['Pindai Kartu', 'Verifikasi Kuota', 'Tanda Tangan & Konfirmasi'];

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const fetchAllNakhoda = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/nakhoda`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAllNakhoda(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch nakhoda list:', error);
        }
    };

    useEffect(() => {
        fetchAllNakhoda();
    }, []);

    useEffect(() => {
        let scanner = null;
        if (activeStep === 0) {
            scanner = new Html5QrcodeScanner("qr-reader", { 
                qrbox: { width: 250, height: 250 }, 
                fps: 5 
            }, false);

            scanner.render(
                (decodedText) => {
                    if (scanner) scanner.clear();
                    handleScanSuccess(decodedText);
                },
                (err) => { /* ignore */ }
            );
        }
        return () => {
            if (scanner) {
                scanner.clear().catch(e => console.error(e));
            }
        };
    }, [activeStep]);

    const handleScanSuccess = async (scannedQrId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/nakhoda/by-qr/${scannedQrId}`);
            if (res?.data?.success) {
                setNakhodaData(res.data.data);
                handleNext();
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Data Nakhoda berdasarkan QR tidak ditemukan.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedManual = () => {
        if (!selectedManualNakhoda) {
            setErrorMsg('Silakan pilih Nakhoda atau Kapal terlebih dahulu.');
            return;
        }
        setNakhodaData(selectedManualNakhoda);
        handleNext();
    };

    const handleHitungKuota = () => {
        const d = form.jaket_dewasa_ids.length;
        const a = form.jaket_anak_ids.length;
        if (d === 0 && a === 0) return setErrorMsg('Pilih minimal satu jaket untuk dipinjam.');

        handleNext();
    };

    const handleOpenModal = (type) => {
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
        if (sigPad.current.isEmpty()) {
            return setErrorMsg('Tanda tangan diperlukan sebelum konfirmasi.');
        }
        setLoading(true);

        try {
            let dataURL = '';
            try {
                dataURL = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
            } catch (err) {
                console.warn("Trimmed canvas extraction failed, using full background.", err);
                dataURL = sigPad.current.toDataURL('image/png');
            }

            const payload = {
                nakhoda_id: nakhodaData.id,
                kapal_id: nakhodaData.Kapal.id,
                jaket_dewasa_ids: form.jaket_dewasa_ids,
                jaket_anak_ids: form.jaket_anak_ids,
                ttd_digital: dataURL
            };

            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/peminjaman/checkout`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                // Return to home or reset state
                alert('Peminjaman Berhasil!');
                window.location.reload(); 
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
                            <div id="qr-reader" style={{ width: '100%', minHeight: 400 }}></div>
                            {loading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
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
                                            <Typography variant="body2" color="text.secondary">Terpilih: <b>{form.jaket_dewasa_ids.length}</b> / {Math.ceil(nakhodaData.Kapal.kapasitas_penumpang * 1.25)} (Maks Kuota)</Typography>
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
                                            <Typography variant="body2" color="text.secondary">Terpilih: <b>{form.jaket_anak_ids.length}</b> / {Math.ceil(nakhodaData.Kapal.kapasitas_penumpang * 0.10)} (Maks Kuota)</Typography>
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
                        <Typography variant="h6" fontWeight={800} mb={2}>Pernyataan dan Komitmen Tanggung Jawab Nakhoda</Typography>
                        <Typography component="div" variant="body2" color="text.secondary" mb={4} sx={{ textAlign: 'left', p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100', fontSize: '0.875rem' }}>
                            <Box mb={2}>
                                Saya, <strong>{nakhodaData.nama_lengkap}</strong>, nakhoda kapal <strong>{nakhodaData.Kapal?.nama_kapal}</strong>, menyetujui peminjaman <strong>{form.jaket_dewasa_ids.length}</strong> jaket dewasa dan <strong>{form.jaket_anak_ids.length}</strong> jaket anak dan akan mengembalikannya dalam keadaan baik.
                            </Box>
                            <Box dangerouslySetInnerHTML={{ __html: komitmenHtml }} />
                        </Typography>

                        <Box sx={{ border: '2px solid #e2e8f0', borderRadius: '16px', bgcolor: 'whitesmoke', mb: 3, overflow: 'hidden' }}>
                            <SignatureCanvas 
                                penColor="black"
                                canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} 
                                ref={sigPad}
                            />
                        </Box>
                        <Button size="small" variant="text" onClick={() => sigPad.current.clear()} sx={{ mb: 4 }} startIcon={<PenTool size={16}/>}>Bersihkan Tanda Tangan</Button>

                        <Box display="flex" gap={2} justifyContent="center" mt={2}>
                            <Button variant="outlined" onClick={handleBack} sx={{ borderRadius: '12px', px: 4, fontWeight: 'bold' }}>Batal</Button>
                            <Button variant="contained" color="success" onClick={handleSubmitCheckout} disabled={loading} sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 'extrabold', fontSize: '1.1rem' }}>
                                {loading ? 'Memproses...' : 'Proses Peminjaman'}
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

            <JaketSelectorModal 
                open={modalData.open} 
                onClose={() => setModalData({...modalData, open: false})}
                onSave={handleSaveSelection}
                maxLimit={modalData.max}
                typeLabel={modalData.type}
                preSelected={modalData.type === 'Dewasa' ? form.jaket_dewasa_ids : form.jaket_anak_ids}
            />
        </Box>
    );
};

export default CheckOut;
