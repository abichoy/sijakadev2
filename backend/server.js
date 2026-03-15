const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const kapalRoutes = require('./routes/kapal');
const nakhodaRoutes = require('./routes/nakhoda');
const inventarisRoutes = require('./routes/inventaris');
const peminjamanRoutes = require('./routes/peminjaman');
const miscRoutes = require('./routes/misc');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Ensure upload directory exists
const fs = require('fs');
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

app.use('/api/auth', authRoutes);
app.use('/api/kapal', kapalRoutes);
app.use('/api/nakhoda', nakhodaRoutes);
app.use('/api/inventaris', inventarisRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api', miscRoutes);

// Add base route for check
app.get('/', (req, res) => {
    res.send('SiJaka API Server running');
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
    console.log('Database connected and synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database: ', err);
});
