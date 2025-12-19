import { 
  ApiResponse, 
  User, 
  CreateUserDTO, 
  LoginDTO,
  Product, 
  CreateProductDTO, 
  Order, 
  CreateOrderDTO,
  OrderStatus 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
}

// ============ USER APIs ============
export const userApi = {
  getAll: () => fetchApi<User[]>('/users'),
  
  getById: (id: number) => fetchApi<User>(`/users/${id}`),
  
  getByEmail: (email: string) => fetchApi<User>(`/users/email/${email}`),
  
  login: (credentials: LoginDTO) =>
    fetchApi<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  create: (user: CreateUserDTO) => 
    fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  
  update: (id: number, user: CreateUserDTO) =>
    fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),
  
  delete: (id: number) =>
    fetchApi<null>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ============ PRODUCT APIs ============
export const productApi = {
  getAll: () => fetchApi<Product[]>('/products'),
  
  getById: (id: number) => fetchApi<Product>(`/products/${id}`),
  
  search: (name: string) => fetchApi<Product[]>(`/products/search?name=${encodeURIComponent(name)}`),
  
  getByMaxCost: (maxCost: number) => fetchApi<Product[]>(`/products/max-cost?maxCost=${maxCost}`),
  
  getAvailable: () => fetchApi<Product[]>('/products/available'),
  
  create: (product: CreateProductDTO) =>
    fetchApi<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  
  update: (id: number, product: CreateProductDTO) =>
    fetchApi<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  
  updateQuantity: (id: number, quantity: number) =>
    fetchApi<Product>(`/products/${id}/quantity?quantity=${quantity}`, {
      method: 'PATCH',
    }),
  
  delete: (id: number) =>
    fetchApi<null>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// ============ ORDER APIs ============
export const orderApi = {
  getAll: () => fetchApi<Order[]>('/orders'),
  
  getById: (id: number) => fetchApi<Order>(`/orders/${id}`),
  
  getByUser: (userId: number) => fetchApi<Order[]>(`/orders/user/${userId}`),
  
  getByStatus: (status: OrderStatus) => fetchApi<Order[]>(`/orders/status/${status}`),
  
  getByUserAndStatus: (userId: number, status: OrderStatus) => 
    fetchApi<Order[]>(`/orders/user/${userId}/status/${status}`),
  
  create: (order: CreateOrderDTO) =>
    fetchApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  
  updateStatus: (id: number, status: OrderStatus) =>
    fetchApi<Order>(`/orders/${id}/status?status=${status}`, {
      method: 'PATCH',
    }),
  
  delete: (id: number) =>
    fetchApi<null>(`/orders/${id}`, {
      method: 'DELETE',
    }),
};
