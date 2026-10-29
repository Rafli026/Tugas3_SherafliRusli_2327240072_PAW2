const Category = require('../models/categoryModel');

exports.create = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ status: 'success', data: category });
};

exports.getAll = async (req, res) => {
  const data = await Category.find().sort({ nama: 1 });
  res.json({ status: 'success', data });
};