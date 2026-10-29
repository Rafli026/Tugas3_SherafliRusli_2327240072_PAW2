const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama kategori wajib diisi'],
      unique: true,
      trim: true,
    },
    deskripsi: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);