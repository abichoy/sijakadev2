import { useState } from 'react';
import { Box, Typography, Card, Grid, Button, IconButton, Paper, Divider } from '@mui/material';
import { ShieldCheck, Anchor, Waves, CheckCircle, Info, Flame, AlertCircle } from 'lucide-react';

const Edukasi = () => {
    const [lang, setLang] = useState('id'); // id, bugis, makassar

    const content = {
        id: {
            title: "Seragam Pelaut Hebat",
            subtitle: "Panduan Keselamatan Maritim Terpadu",
            intro: "Mengenakan jaket keselamatan bukanlah tanda kelemahan, melainkan wujud tanggung jawab nakhoda tangguh. Ianya 'Seragam Pelaut Hebat' yang melindungi penumpang.",
            steps: [
                { title: "Periksa Kondisi Jaket", desc: "Pastikan jaket tidak robek, gesper lengkap, dan tali pengikat dalam keadaan kuat." },
                { title: "Kenakan Lewat Kepala", desc: "Masukkan kepala ke lubang jaket, pastikan bagian depan/belakang tidak terbalik." },
                { title: "Kencangkan Tali & Sabuk", desc: "Tarik sabuk dan ikat erat sesuai ukuran tubuh agar jaket tidak terlepas di air." },
                { title: "Periksa Ulang Sebelum Berangkat", desc: "Pastikan semua pengait terkunci benar sebelum meninggalkan dermaga." }
            ],
            features: [
                { title: "Warna Oranye & Reflektif", desc: "Memantulkan cahaya dan mencolok." },
                { title: "Peluit & Lampu Otomatis", desc: "Sinyal suara & visual menyala saat basah." },
                { title: "Tali Pengikat", desc: "Digunakan saling mengikat dengan penumpang lain." }
            ],
            rules: [
                "Wajib Dipakai Sebelum Berlayar",
                "Hak Setiap Penumpang (Termasuk Anak)",
                "Standar Keamanan Tinggi SOLAS",
                "BUKAN Pertanda Celaka (Mitos Pammali)",
                "Peminjaman Gratis di Stasiun Dermaga"
            ]
        },
        bugis: {
            title: "Pakaian Passompe' Macca",
            subtitle: "Panggaja' Keselamatan",
            intro: "Mappake jaket keselamatan tannia tanra atettongeng, tapinya wija tanggung jawab nakhoda matanre.",
            steps: [
                { title: "Mita macca'i jaket", desc: "Pastikang tali'na nennia gesperna magello." },
                { title: "Pake'i paddato rompi", desc: "Pastikang ukuran siagaga alena." },
                { title: "Salloki sininna gesper", desc: "Ri dadana na awak'na pole maro." },
                { title: "Cek ulang makkale", desc: "Narekko maeloki lao sipakamacca." }
            ],
            features: [
                { title: "Warna Celleng Oranye", desc: "Mabangka ni cinna mita." },
                { title: "Peluit sibawa Lampu", desc: "Mattappa alena makkalaruang wae." },
                { title: "Tali Sipakalebbi", desc: "Nattajengang ro passompe' laengnge." }
            ],
            rules: [
                "Pakei yolo deppa ri laleng",
                "Haq'na Tolo Penumpang",
                "Standar SOLAS mabessa",
                "Tennia tanra bala (Pammali)",
                "Pijang percuma makkale UPP"
            ]
        },
        makassar: {
            title: "Baju Pelaut Baji",
            subtitle: "Pangngajara' Keselamatan",
            intro: "A'pake jaket keselamatan tena na tanda kamaloloan, mingka bukti tanggung jawab nakhoda appala'.",
            steps: [
                { title: "Cini' baji-bajiki jaket", desc: "Pangngewa talinna nennia gesperna matu." },
                { title: "Pakei rapang rompi", desc: "Cini ukuranna baji pole kalenta." },
                { title: "Kassa'ki sikamma gesper", desc: "Awakya narapi' baji nennia ta'balle-balle." },
                { title: "Pariksa pole kamma", desc: "Sallang tenaki jappa jappa." }
            ],
            features: [
                { title: "Warna kacci kacci", desc: "Attayang cini battu bella." },
                { title: "Pippi siagang Lampu", desc: "Anyala punna narapiki jene'." },
                { title: "Tali passa'la", desc: "Passikoki pole tau maraeng." }
            ],
            rules: [
                "Pakeki riolo tenapi lari",
                "Hakka sikamma tau",
                "Standar SOLAS Tinggiki",
                "Teaki silii pammali",
                "Minjama tena doe' ri UPP"
            ]
        }
    };

    const currentData = content[lang];

    return (
        <Box sx={{ pb: 8 }}>
            <Box 
                sx={{ 
                    position: 'relative', 
                    borderRadius: '32px', 
                    bgcolor: 'primary.main', 
                    p: { xs: 4, md: 8 }, 
                    textAlign: 'center', 
                    color: 'white', 
                    mb: 4, 
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #00639C 0%, #17325c 100%)',
                    boxShadow: '0 20px 40px rgba(0,99,156,0.3)',
                }}
            >
                <Box sx={{ position: 'absolute', opacity: 0.1, inset: 0, background: 'url("https://www.transparenttextures.com/patterns/black-mamba.png")' }} />
                
                <Box position="relative" zIndex={1}>
                    <Box sx={{ display: 'inline-flex', bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: '50%', backdropFilter: 'blur(10px)', mb: 3 }}>
                        <Anchor size={48} color="#e0f2fe" />
                    </Box>
                    <Typography variant="h2" fontWeight={900} letterSpacing={-1} mb={1}>{currentData.title}</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 2, color: 'primary.light', mb: 4 }}>{currentData.subtitle}</Typography>
                    <Typography variant="h6" fontWeight={400} sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, opacity: 0.9 }}>
                        "{currentData.intro}"
                    </Typography>
                </Box>
            </Box>

            <Box display="flex" justifyContent="center" gap={2} mb={6}>
                {[
                    { id: 'id', label: '🇮🇩 Indonesia' },
                    { id: 'bugis', label: '🦋 Bugis' },
                    { id: 'makassar', label: '⛵ Makassar' }
                ].map(l => (
                    <Button 
                        key={l.id} 
                        variant={lang === l.id ? 'contained' : 'outlined'} 
                        onClick={() => setLang(l.id)}
                        sx={{ 
                            borderRadius: '30px', 
                            px: { xs: 2, md: 4 }, 
                            py: 1.5, 
                            fontWeight: 800, 
                            borderWidth: 2,
                            borderColor: lang === l.id ? 'transparent' : 'primary.100',
                            bgcolor: lang === l.id ? 'primary.main' : 'background.paper',
                            color: lang === l.id ? 'white' : 'text.primary',
                            boxShadow: lang === l.id ? '0 8px 20px rgba(0,99,156,0.4)' : 'none',
                        }}
                    >
                        {l.label}
                    </Button>
                ))}
            </Box>

            <Grid container spacing={4} mb={6}>
                <Grid item xs={12}>
                    <Typography variant="h5" fontWeight={900} textAlign="center" mb={4} color="text.primary">Panduan 4 Langkah Keselamatan</Typography>
                    <Grid container spacing={3}>
                        {currentData.steps.map((step, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                                <Card sx={{ 
                                    height: '100%', 
                                    borderRadius: '24px', 
                                    p: 3, 
                                    border: '1px solid',
                                    borderColor: 'primary.50',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(0,99,156,0.1)' }
                                }}>
                                    <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'primary.50', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, mb: 3 }}>
                                        {idx + 1}
                                    </Box>
                                    <Typography variant="h6" fontWeight={800} mb={1}>{step.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{step.desc}</Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: '32px', p: 4, height: '100%', bgcolor: 'secondary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.1, transform: 'scale(1.5)' }}>
                            <Info size={200} />
                        </Box>
                        <Box display="flex" alignItems="center" gap={2} mb={4} position="relative" zIndex={1}>
                            <Box p={1.5} bgcolor="rgba(255,255,255,0.2)" borderRadius={2}>
                                <Flame size={28} />
                            </Box>
                            <Typography variant="h5" fontWeight={900}>Pengenalan Fitur Jaket</Typography>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={3} position="relative" zIndex={1}>
                            {currentData.features.map((ft, idx) => (
                                <Box key={idx}>
                                    <Typography variant="subtitle1" fontWeight={800} mb={0.5}>{ft.title}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{ft.desc}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: '32px', p: 4, height: '100%', border: '2px solid', borderColor: 'primary.100', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <Box p={1.5} bgcolor="primary.50" color="primary.main" borderRadius={2}>
                                <ShieldCheck size={28} />
                            </Box>
                            <Typography variant="h5" fontWeight={900}>Aturan & Mitos Keselamatan</Typography>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={2}>
                            {currentData.rules.map((rule, idx) => (
                                <Box key={idx} display="flex" alignItems="center" gap={2} p={2} bgcolor="background.default" borderRadius={3}>
                                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">{rule}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Edukasi;
