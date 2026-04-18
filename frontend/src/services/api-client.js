import api from './api';

export const authAPI = {
  register: (data) =>
    api.post('/auth/register', data),

  login: (data) =>
    api.post('/auth/login', data),
  
  googleAuth: (idToken) =>
    api.post('/auth/google-auth', { idToken }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data) =>
    api.put('/auth/profile', data),
  
  refreshToken: () =>
    api.post('/auth/refresh-token'),
};

export const productAPI = {
  getAll: (params) =>
    api.get('/products', { params }),
  
  getById: (id) =>
    api.get(`/products/${id}`),
  
  create: (data) =>
    api.post('/products', data),
  
  update: (id, data) =>
    api.put(`/products/${id}`, data),
  
  delete: (id) =>
    api.delete(`/products/${id}`),
  
  getFeatured: () =>
    api.get('/products/featured'),
  
  getPresignedUrl: (fileName, contentType) =>
    api.post('/products/upload/presigned-url', { fileName, contentType }),
};

export const orderAPI = {
  create: (data) =>
    api.post('/orders', data),
  
  getAll: (params) =>
    api.get('/orders', { params }),
  
  getById: (id) =>
    api.get(`/orders/${id}`),
  
  confirmPayment: (paymentIntentId) =>
    api.post('/orders/confirm-payment', { paymentIntentId }),
  
  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }),
};

export const vendorAPI = {
  register: (data) =>
    api.post('/vendors/register', data),
  
  getProfile: () =>
    api.get('/vendors/profile'),
  
  updateProfile: (data) =>
    api.put('/vendors/profile', data),
  
  getById: (id) =>
    api.get(`/vendors/${id}`),
  
  getAll: (params) =>
    api.get('/vendors', { params }),
  
  getProducts: (vendorId, params) =>
    api.get(`/vendors/${vendorId}/products`, { params }),
  
  getEarnings: () =>
    api.get('/vendors/earnings'),
  
  approve: (vendorId, reason) =>
    api.post(`/vendors/${vendorId}/approve`, { reason }),
  
  reject: (vendorId, reason) =>
    api.post(`/vendors/${vendorId}/reject`, { reason }),
};

export const chatAPI = {
  getOrCreateConversation: (vendorId, productId) =>
    api.post('/chat/conversations', { vendorId, productId }),
  
  getConversations: (params) =>
    api.get('/chat/conversations', { params }),
  
  getMessages: (conversationId, params) =>
    api.get(`/chat/conversations/${conversationId}`, { params }),
  
  sendMessage: (conversationId, message, attachments) =>
    api.post('/chat/messages', { conversationId, message, attachments }),
  
  markAsRead: (conversationId) =>
    api.put(`/chat/conversations/${conversationId}/mark-read`),
  
  closeConversation: (conversationId) =>
    api.put(`/chat/conversations/${conversationId}/close`),
};
