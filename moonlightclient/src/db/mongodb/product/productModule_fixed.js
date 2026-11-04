import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      // required:true,
      trim: true,
    },
    sku: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subCategory: {
      type: String,
      default: '',
    },
    machineType: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    pageTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    metaKeywords: {
      type: String,
      default: '',
    },
    specifications: {
      productionCapacity: { type: String, default: '' },
      motor: { type: String, default: '' },
      totalPower: { type: String, default: '' },
      powerSource: { type: String, default: '' },
      voltage: { type: String, default: '' },
      phase: { type: String, default: '' },
      weight: { type: String, default: '' },
      rawMaterial: { type: String, default: '' },
      dimensions: {
        length: { type: Number, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
        unit: { type: String, default: 'inch' },
      },
      plateSizeRange: { type: String, default: '' },
      rollerSize: { type: String, default: '' },
      drive: { type: String, default: '' },
      paperCupSizeRange: { type: String, default: '' },
      electricityBillEstimate: { type: String, default: '' },
    },
    pricing: {
      currency: { type: String, default: 'INR' },
      basePrice: { type: Number, required: true },
      priceLabel: { type: String, default: '' },
      otherExpenses: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
    },
    itemsProduced: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    warranty: {
      type: String,
      default: '',
    },
    deliveryTime: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      default: 'In Stock',
    },
    isReturnable: {
      type: Boolean,
      default: false,
    },
    mainMarket: {
      type: String,
      default: 'India',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    stock: {
      type: Number,
      default: 0,
    },
    threshold: {
      type: Number,
      default: 0,
    },
    slider: {
      type: Boolean,
      default: false,
    },
    slider_image: {
      type: String,
      default: "",
    },
    video: {
      type: Boolean,
      default: false,
    },
    video_link: {
      type: String,
      default: "",
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Crucial Next.js fix: prevents recreating the model on hot-reloads
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;