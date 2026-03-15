const sequelize = require('../config/database');
const User = require('./User');
const Kapal = require('./Kapal');
const Nakhoda = require('./Nakhoda');
const Inventaris = require('./Inventaris');
const TransaksiPeminjaman = require('./TransaksiPeminjaman');
const TransaksiJaket = require('./TransaksiJaket');

// Kapal - Nakhoda (1 to 1 or 1 to many, specified as 1 to 1 in prompt)
Kapal.hasOne(Nakhoda, { foreignKey: 'kapal_id', as: 'Nakhoda' });
Nakhoda.belongsTo(Kapal, { foreignKey: 'kapal_id', as: 'Kapal' });

// Transaksi - Nakhoda & Kapal
Nakhoda.hasMany(TransaksiPeminjaman, { foreignKey: 'nakhoda_id' });
TransaksiPeminjaman.belongsTo(Nakhoda, { foreignKey: 'nakhoda_id', as: 'Nakhoda' });

Kapal.hasMany(TransaksiPeminjaman, { foreignKey: 'kapal_id' });
TransaksiPeminjaman.belongsTo(Kapal, { foreignKey: 'kapal_id', as: 'Kapal' });

// Transaksi - TransaksiJaket => Inventaris
TransaksiPeminjaman.hasMany(TransaksiJaket, { foreignKey: 'transaksi_id', as: 'DetailPeminjaman' });
TransaksiJaket.belongsTo(TransaksiPeminjaman, { foreignKey: 'transaksi_id' });

Inventaris.hasMany(TransaksiJaket, { foreignKey: 'jaket_id' });
TransaksiJaket.belongsTo(Inventaris, { foreignKey: 'jaket_id', as: 'Inventaris' });

module.exports = {
    sequelize,
    User,
    Kapal,
    Nakhoda,
    Inventaris,
    TransaksiPeminjaman,
    TransaksiJaket
};
