require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bouquetRoutes = require('./routes/bouquetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'API Bouquet Tugas 3 aktif' });
});

app.use('/bouquets', bouquetRoutes);
app.use('/categories', categoryRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.name === 'ValidationError' ? 400 : 500).json({
    status: 'error',
    message: err.message || 'Terjadi kesalahan server',
  });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    app.listen(PORT, () => console.log(`Server aktif di http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Gagal terhubung ke MongoDB:', error.message);
    process.exit(1);
  });