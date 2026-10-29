const mongoose = require('mongoose');
const Bouquet = require('../models/bouquetModel');
const Category = require('../models/categoryModel');

const SORT_FIELDS = ['nama', 'harga', 'stok', 'createdAt'];
const SELECT_FIELDS = [
  'nama',
  'kategori',
  'detailBunga',
  'harga',
  'stok',
  'createdAt',
];

function parseBoundedInt(value, fallback, min, max) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

exports.create = async (req, res) => {
  const bouquet = await Bouquet.create(req.body);
  await bouquet.populate('kategori', 'nama deskripsi');
  res.status(201).json({ status: 'success', data: bouquet });
};

exports.getAll = async (req, res) => {
  const filter = {};

  if (req.query.nama) {
    filter.nama = { $regex: String(req.query.nama), $options: 'i' };
  }

  if (req.query.jenisBunga) {
    filter['detailBunga.jenisBunga'] = {
      $regex: String(req.query.jenisBunga),
      $options: 'i',
    };
  }

  if (req.query.kategori) {
    const category = await Category.findOne({
      nama: { $regex:
`^${String(req.query.kategori)}$`, $options: 'i' },
    });
    filter.kategori = category ? category._id : { $in: [] };
  }

  if (req.query.minHarga || req.query.maxHarga) {
    filter.harga = {};
    if (req.query.minHarga) filter.harga.$gte = Number(req.query.minHarga);
    if (req.query.maxHarga) filter.harga.$lte = Number(req.query.maxHarga);
  }

  const page = parseBoundedInt(req.query.page, 1, 1, 100000);
  const limit = parseBoundedInt(req.query.limit, 10, 1, 50);

  const sortParam = String(req.query.sort || '-createdAt');
  const direction = sortParam.startsWith('-') ? -1 : 1;
  const sortField = sortParam.replace(/^-/, '');

  if (!SORT_FIELDS.includes(sortField)) {
    return res.status(400).json({
      status: 'error',
      message: `sort hanya boleh: ${SORT_FIELDS.join(', ')}`,
    });
  }

  let select = '';
  if (req.query.fields) {
    const fields = String(req.query.fields)
      .split(',')
      .map((field) => field.trim());

    if (!fields.every((field) => SELECT_FIELDS.includes(field))) {
      return res.status(400).json({
        status: 'error',
        message: `fields hanya boleh: ${SELECT_FIELDS.join(', ')}`,
      });
    }
    select = fields.join(' ');
  }

  const query = Bouquet.find(filter)
    .select(select)
    .sort({ [sortField]: direction, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  if (!select || select.split(' ').includes('kategori')) {
    query.populate('kategori', 'nama deskripsi');
  }

  const [data, total] = await Promise.all([
    query,
    Bouquet.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

exports.getById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ status: 'error', message: 'ID tidak valid' });
  }

  const data = await Bouquet.findById(req.params.id).populate(
    'kategori',
    'nama deskripsi'
  );

  if (!data) {
    return res.status(404).json({ status: 'error', message: 'Buket tidak ditemukan' });
  }

  res.json({ status: 'success', data });
};

exports.update = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ status: 'error', message: 'ID tidak valid' });
  }

  const data = await Bouquet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('kategori', 'nama deskripsi');

  if (!data) {
    return res.status(404).json({ status: 'error', message: 'Buket tidak ditemukan' });
  }

  res.json({ status: 'success', data });
};

exports.remove = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ status: 'error', message: 'ID tidak valid' });
  }

  const data = await Bouquet.findByIdAndDelete(req.params.id);
  if (!data) {
    return res.status(404).json({ status: 'error', message: 'Buket tidak ditemukan' });
  }

  res.status(204).send();
};
