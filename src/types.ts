export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Actual selling price
  originalPrice?: number; // Price before discount (optional)
  imageUrl: string;
  imageUrls?: string[];
  stock: number;
  category: string;
  discountBadge?: string; // e.g., "ຫຼຸດ 20%", "ຂາຍດີ"
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  contactPhone: string;
  shippingAddress: string;
  shippingProvider: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'ລໍຖ້າດຳເນີນການ' | 'ກຳລັງຈັດສົ່ງ' | 'ຈັດສົ່ງສຳເລັດ' | 'ຍົກເລີກ';
  createdAt: string;
  paymentMethod?: string; // e.g., "BCEL One"
  paymentSlip?: string; // payment slip image URL
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface ShopSettings {
  shopName: string;
  slogan: string;
  contactPhone: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
}

export interface SlideItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export interface CarrierItem {
  id: string;
  name: string;
  logo: string;
  desc: string;
}
