import mongoose, { Schema } from 'mongoose';

// User Schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' }, // 'admin', 'staff', 'customer'
  points: { type: Number, default: 0 },
  tier: { type: String, default: 'Bronze' },
  full_name: String,
  gender: String,
  dob: String,
  phone: String,
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Brand Schema
const brandSchema = new Schema({
  name: { type: String, required: true },
  logo_url: String,
  description: String,
  origin: String,
}, { timestamps: true });

export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

// Product Schema
const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  original_price: { type: Number, required: true },
  discount_percent: { type: Number, required: true },
  image_url: { type: String, required: true },
  category_name: { type: String, required: true },
  is_flash_deal: { type: Boolean, default: false },
  sold_count: { type: Number, default: 0 },
  delivery_time: { type: String, default: '2H' },
  brand_id: { type: Schema.Types.ObjectId, ref: 'Brand' },
  capacities: String, // Stringified JSON array for capacities
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Store Schema
const storeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  type: { type: String, required: true }, // e.g. 'clinic', 'store'
  phone: String,
  shop_hours: String,
  clinic_hours: String,
  booking_url: String,
  lat: Number,
  lng: Number,
}, { timestamps: true });

export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);

// Warranty Schema
const warrantySchema = new Schema({
  phone: { type: String, required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
  serial_numbers: String,
  notes: String,
}, { timestamps: true });

export const Warranty = mongoose.models.Warranty || mongoose.model('Warranty', warrantySchema);

// Spa Service Schema
const spaServiceSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. 'mặt', 'body'
  price: { type: Number, required: true },
  duration_minutes: { type: Number, default: 60 },
  description: String,
}, { timestamps: true });

export const SpaService = mongoose.models.SpaService || mongoose.model('SpaService', spaServiceSchema);

// Spa Booking Schema
const spaBookingSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  service_id: { type: Schema.Types.ObjectId, ref: 'SpaService', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Store' },
  booking_time: { type: Date, required: true },
  status: { type: String, default: 'pending' }, // 'pending', 'confirmed', 'completed', 'cancelled'
}, { timestamps: true });

export const SpaBooking = mongoose.models.SpaBooking || mongoose.model('SpaBooking', spaBookingSchema);

// Review Schema
const reviewSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
  service_id: { type: Schema.Types.ObjectId, ref: 'SpaService' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  image_urls: String, // "url1||url2"
  is_verified_purchase: { type: Boolean, default: false },
}, { timestamps: true });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// Product QA Schema
const productQaSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  question: { type: String, required: true },
  answer: String,
  answered_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const ProductQa = mongoose.models.ProductQa || mongoose.model('ProductQa', productQaSchema);

// Address Schema
const addressSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  province: { type: String, required: true },
  district: String,
  is_default: { type: Boolean, default: false },
}, { timestamps: true });

export const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

// Order Schema
const orderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  total_amount: { type: Number, required: true },
  discount_amount: { type: Number, default: 0 },
  final_amount: { type: Number, required: true },
  delivery_type: { type: String, default: 'standard' }, // 'standard', '2H'
  payment_method: { type: String, default: 'cash' }, // 'cash', 'momo', 'qr'
  payment_status: { type: String, default: 'pending' }, // 'pending', 'completed'
  order_status: { type: String, default: 'processing' },
  address_id: { type: Schema.Types.ObjectId, ref: 'Address' },
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Order Item Schema
const orderItemSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

export const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);

// Order Tracking Schema
const orderTrackingSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, required: true },
  message: String,
}, { timestamps: true });

export const OrderTracking = mongoose.models.OrderTracking || mongoose.model('OrderTracking', orderTrackingSchema);

// Blog Schema
const blogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  thumbnail_url: String,
  category: { type: String, default: 'Chung' },
  author_id: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

// Voucher Schema
const voucherSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discount_amount: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
});

export const Voucher = mongoose.models.Voucher || mongoose.model('Voucher', voucherSchema);

// Timesheet Schema
const timesheetSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  check_in_time: Date,
  check_out_time: Date,
});

export const Timesheet = mongoose.models.Timesheet || mongoose.model('Timesheet', timesheetSchema);

// Wishlist Schema
const wishlistSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });
wishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
