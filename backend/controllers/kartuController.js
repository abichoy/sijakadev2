const { Kapal, Nakhoda } = require('../models');
const QRCode = require('qrcode');

exports.generateKartuPDF = async (req, res) => {
    try {
        const nakhodaId = req.params.id;
        const nakhoda = await Nakhoda.findByPk(nakhodaId, {
            include: [{ model: Kapal, as: 'Kapal' }]
        });
        
        if (!nakhoda) return res.status(404).send('Nakhoda not found');
        
        const kapal = nakhoda.Kapal || { nama_kapal: '-', kapasitas_penumpang: 0 };
        const qrCodeDataUrl = await QRCode.toDataURL(nakhodaId, { margin: 1, width: 150 });
        
        // Host for the foto
        const hostUrl = req.protocol + '://' + req.get('host');
        // Red shirt illustration fallback
        const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=nakhoda&clothing=shirtCrewNeck&clothingColor=ff4040&top=shortHair&skinColor=edb98a';
        const fotoUrl = nakhoda.foto ? hostUrl + nakhoda.foto : defaultAvatar;

        const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Kartu Identitas - ${nakhoda.nama_lengkap}</title>
            <style>
                @media print {
                    @page { 
                        size: 53.98mm 85.60mm portrait;
                        margin: 0; 
                    }
                    body {
                        margin: 0; 
                        padding: 0;
                        background: white !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .kartu {
                        box-shadow: none !important;
                        width: 100% !important;
                        height: 100% !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                    }
                }
                *, *::before, *::after { box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    display: flex; justify-content: center; align-items: center; 
                    height: 100vh; background-color: #e0e6ed; margin: 0; 
                }
                .kartu { 
                    width: 53.98mm; 
                    height: 85.60mm;
                    background: white; 
                    position: relative;
                    overflow: hidden;
                    border-radius: 3mm;
                    box-shadow: 0 2mm 5mm rgba(0,0,0,0.15); 
                }
                .top-bg {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 28mm;
                    background-color: #0288d1;
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%2329b6f6" fill-opacity="1" d="M0,96L80,112C160,128,320,160,480,154.7C640,149,800,107,960,112C1120,117,1280,171,1360,197.3L1440,224L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path><path fill="%230288d1" fill-opacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,192C1120,181,1280,139,1360,117.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path></svg>') center top / cover no-repeat;
                    z-index: 1;
                }
                .content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    padding-top: 4mm;
                }
                .header-title {
                    background-color: #01579b;
                    color: white;
                    padding: 1.2mm 3.5mm;
                    border-radius: 10mm;
                    font-size: 2.2mm;
                    font-weight: 800;
                    letter-spacing: 0.1mm;
                    text-transform: uppercase;
                }
                .foto-profil {
                    margin-top: 3.5mm;
                    width: 22mm; 
                    height: 22mm; 
                    border-radius: 50%; 
                    object-fit: cover; 
                    border: 1.2mm solid #0288d1; 
                    background-color: #fff;
                    padding: ${nakhoda.foto ? '0' : '0.5mm'};
                }
                .divider {
                    width: 80%;
                    height: 0.2mm;
                    background-color: #d1d5db;
                    margin: 2mm 0;
                }
                .qr-section {
                    text-align: center;
                }
                .qr-section img {
                    width: 16mm; 
                    height: 16mm; 
                    display: block;
                    margin: 0 auto;
                }
                .qr-section p {
                    margin: 1.2mm 0 0; 
                    font-size: 1.8mm; 
                    color: #000; 
                    font-weight: normal;
                }
                .info-section {
                    width: 84%;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5mm;
                    margin-top: 0.5mm;
                }
                .info-row {
                    display: flex;
                    align-items: center;
                }
                .info-label {
                    background-color: #0288d1;
                    color: white;
                    border-radius: 10mm;
                    padding: 1.2mm 2.5mm;
                    font-weight: normal;
                    width: 15mm;
                    text-align: right;
                    font-size: 1.7mm;
                    flex-shrink: 0;
                }
                .info-value {
                    margin-left: 2.5mm;
                    font-weight: normal;
                    color: #222;
                    font-size: 1.8mm;
                    flex-grow: 1;
                    text-transform: uppercase;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .footer {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 6.5mm;
                    background-color: #01579b;
                    color: white;
                    text-align: center;
                    font-weight: bold;
                    font-size: 1.7mm;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2;
                }
            </style>
        </head>
        <body>
            <div class="kartu">
                <div class="top-bg"></div>
                
                <div class="content">
                    <div class="header-title">KARTU IDENTITAS NAKHODA</div>
                    
                    <img src="${fotoUrl}" alt="Foto Nakhoda" class="foto-profil">
                    
                    <div class="divider"></div>
                    
                    <div class="qr-section">
                        <img src="${qrCodeDataUrl}" alt="QR Code">
                        <p>ID : ${nakhodaId.substring(0,8).toUpperCase()}</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="info-section">
                        <div class="info-row">
                            <div class="info-label">NAMA :</div>
                            <div class="info-value">${nakhoda.nama_lengkap}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">KAPAL :</div>
                            <div class="info-value">${kapal.nama_kapal}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">KONTAK :</div>
                            <div class="info-value">${nakhoda.kontak || '-'}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    KANTOR UPP KELAS II MACCINI BAJI
                </div>
            </div>
        </body>
        </html>
        `;
        res.send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.generateQRCodePNG = async (req, res) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(req.params.id_kapal);
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
        const img = Buffer.from(base64Data, 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img); 
    } catch (error) {
        res.status(500).send(error.message);
    }
};
