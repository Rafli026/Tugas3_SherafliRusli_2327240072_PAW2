const mongoose = require('mongoose');

const detailBungaSchema = new mongoose.Schema(
  {
    jenisBunga: { type: String, required: true, trim: true },
    warna: { type: String, required: true, trim: true },
    jumlah: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const bouquetSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    kategori: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    detailBunga: {
      type: [detailBungaSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Minimal satu detail bunga harus diisi',
      },
    },
    harga: { type: Number, required: true, min: 0 },
    stok: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bouquet', bouquetSchema);