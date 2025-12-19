// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// User types
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  address: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
  address: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Product types
export interface Product {
  id: number;
  productName: string;
  quantity: number;
  cost: number;
  productDesc: string;
  productUrl?: string;
}

export interface CreateProductDTO {
  productName: string;
  quantity: number;
  cost: number;
  productDesc: string;
  productUrl?: string;
}

// Order types
export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface Order {
  id: number;
  userId: number;
  productId: number;
  orderStatus: OrderStatus;
  quantity: number;
  createdAt: string;
  userName: string;
  productName: string;
}

export interface CreateOrderDTO {
  userId: number;
  productId: number;
  quantity: number;
}
