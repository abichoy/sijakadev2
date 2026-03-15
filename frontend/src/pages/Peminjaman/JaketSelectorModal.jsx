import { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, List, ListItem, Checkbox, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Search, Layers } from 'lucide-react';
import axios from 'axios';

const JaketSelectorModal = ({ open, onClose, onSave, maxLimit, typeLabel, preSelected = [] }) => {
    const [available, setAvailable] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(preSelected);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedIds(preSelected);
            fetchAvailableJaket();
        }
    }, [open]);

    const fetchAvailableJaket = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventaris`, { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.data?.success) {
                // Filter yang sesuai tipe (anak/dewasa) dan yang statusnya sedang 'baik'
                const filtered = res.data.data.filter(j => j.jenis === typeLabel.toLowerCase() && j.kondisi === 'baik');
                setAvailable(filtered);
            }
        } catch (error) {
            console.error('Failed fetching inventaris for modal', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            
            if (prev.length >= maxLimit) {
                alert(`Kapasitas maksimal jaket ${typeLabel} untuk kapal ini sudah penuh (${maxLimit} jaket).`);
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleSelectAllMatches = () => {
        const matchingIds = available.filter(j => j.kode_jaket.toLowerCase().includes(searchQuery.toLowerCase())).map(j => j.id);
        const uniqueToSelect = [...new Set([...selectedIds, ...matchingIds])];
        
        if (uniqueToSelect.length > maxLimit) {
            alert(`Tidak bisa memilih semua list. Kuota tersisa tidak mencukupi. (Max: ${maxLimit})`);
            return;
        }
        setSelectedIds(uniqueToSelect);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Layers color="#1e40af" />
                <Typography variant="h6" fontWeight="800">Pilih Jaket {typeLabel}</Typography>
            </DialogTitle>
            
            <DialogContent dividers sx={{ pb: 1 }}>
                <Box mb={3}>
                    <Typography variant="body2" color="secondary.main" fontWeight="bold" mb={2}>
                        Terpilih: {selectedIds.length} / {maxLimit} Maksimal
                    </Typography>
                    
                    <TextField 
                        fullWidth 
                        size="small"
                        placeholder={`Cari dari ${available.length} kode jaket ${typeLabel} yang tersedia...`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>
                        }}
                    />
                </Box>
                
                <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, height: 280, overflow: 'auto' }}>
                    <List disablePadding>
                        {loading && <ListItem><ListItemText secondary="Memuat data..." /></ListItem>}
                        {!loading && available.length === 0 && <ListItem><ListItemText secondary={`Tidak ada jaket ${typeLabel} (kondisi baik) yang tersedia saat ini.`} /></ListItem>}
                        
                        {available
                            .filter(j => j.kode_jaket.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(j => {
                                const isSelected = selectedIds.includes(j.id);
                                return (
                                    <ListItem key={j.id} button onClick={() => handleToggle(j.id)} sx={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <Checkbox checked={isSelected} disableRipple color="primary" />
                                        <ListItemText 
                                            primary={j.kode_jaket} 
                                            secondary={`Lokasi: ${j.lokasi_penyimpanan}`}
                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Typography variant="caption" color="success.main" fontWeight="bold">BAIK</Typography>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                    </List>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button onClick={handleSelectAllMatches} size="small" variant="text">Pilih Semua Filter</Button>
                <Box display="flex" gap={1}>
                    <Button onClick={onClose} variant="outlined" color="inherit">Batal</Button>
                    <Button onClick={() => onSave(selectedIds)} variant="contained" color="primary">Konfirmasi ({selectedIds.length})</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default JaketSelectorModal;
