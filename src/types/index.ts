export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerName: string;
  address: string;
  paymentMethod: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'buyer' | 'admin';
  wishlist: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  postal_code: string;
  street_address: string;
  label: string; // 'Home', 'Work', or custom
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'guest' | 'buyer' | 'admin';

// ===== NEW FEATURE 1: Terms Agreement =====
export interface TermsAgreement {
  id: string;
  user_id: string;
  accepted_at: string;
  version: string;
  ip_address?: string;
}

// ===== NEW FEATURE 2: Product Reviews =====
export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

export interface ReviewWithUserInfo extends ProductReview {
  user_name: string;
  user_email: string;
}

// ===== NEW FEATURE 3: Customer Support Chat =====
export interface Conversation {
  id: string;
  user_id: string;
  status: 'open' | 'unread' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'admin';
  sender_id: string;
  text?: string;
  image_url?: string;
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: ChatMessage[];
  user_name?: string;
  user_email?: string;
}
