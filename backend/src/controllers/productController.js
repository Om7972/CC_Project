const Product = require('../models/Product');
const { generatePresignedUrl, generateFileKey } = require('../services/s3Service');

const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, stock, ...rest } = req.body;

    const product = new Product({
      vendorId: req.user.userId,
      name,
      description,
      category,
      price,
      stock,
      ...rest,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      vendorId,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      featured,
    } = req.query;
    const skip = (page - 1) * limit;

    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (vendorId) filter.vendorId = vendorId;
    if (featured === 'true' || featured === '1') filter.isFeatured = true;

    if (minPrice !== undefined && minPrice !== '') {
      filter.price = { ...filter.price, $gte: Number(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.price = { ...filter.price, $lte: Number(maxPrice) };
    }

    const searchFilter = search
      ? { ...filter, $text: { $search: search } }
      : filter;

    let sort = { createdAt: -1 };
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
        sort = { reviewCount: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    const products = await Product.find(searchFilter)
      .populate('vendorId', 'storeName rating')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Product.countDocuments(searchFilter);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' });
    res.json({ categories: categories.sort((a, b) => a.localeCompare(b)) });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'storeName rating reviewCount');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.vendorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.vendorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getPresignedUrl = async (req, res, next) => {
  try {
    const { fileName, contentType, productId } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'fileName and contentType required' });
    }

    const fileKey = generateFileKey(req.user.userId, 'products', fileName, productId);
    const presignedUrl = await generatePresignedUrl(fileKey, contentType);

    res.json({ presignedUrl, fileKey });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, status: 'active' })
      .populate('vendorId', 'storeName rating')
      .limit(12);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getCategories,
  getProductById,
  updateProduct,
  deleteProduct,
  getPresignedUrl,
  getFeaturedProducts,
};
