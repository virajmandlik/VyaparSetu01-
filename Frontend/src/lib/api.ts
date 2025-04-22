import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (data: { email: string; password: string; name: string; role: 'buyer' | 'seller' }) => {
    console.log('Sending signup request:', data);
    const response = await api.post('/auth/signup', data);
    console.log('Signup response:', response.data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    console.log('Sending login request for:', email);
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    return response.data;
  },

  getProfile: async () => {
    console.log('Getting user profile');
    const response = await api.get('/auth/profile');
    console.log('Profile response:', response.data);
    return response.data;
  }
};

// Product API
export const productAPI = {
  uploadCSV: async (csvFile: File, userId: string) => {
    console.log('Uploading CSV file for user:', userId);
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('userId', userId);

    const response = await api.post('/products/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('CSV upload response:', response.data);
    return response.data;
  },

  completeRegistration: async (userId: string) => {
    console.log('Completing registration for user:', userId);
    const response = await api.post('/products/complete-registration', { userId });
    console.log('Complete registration response:', response.data);
    return response.data;
  },

  getProducts: async (sellerId?: string) => {
    console.log('Getting products' + (sellerId ? ` for seller ${sellerId}` : ''));
    const url = sellerId ? `/products?sellerId=${sellerId}` : '/products';
    const response = await api.get(url);
    console.log('Products response:', response.data);
    return response.data;
  },

  getSales: async () => {
    console.log('Getting sales');
    const response = await api.get('/products/sales');
    console.log('Sales response:', response.data);
    return response.data;
  },

  getDashboardData: async () => {
    console.log('Getting dashboard data');
    const response = await api.get('/products/dashboard');
    console.log('Dashboard data response:', response.data);
    return response.data;
  }
};

// Forecasting API
export const forecastAPI = {
  getSalesForecast: async (days: number = 30) => {
    console.log(`Getting sales forecast for ${days} days`);
    const response = await api.get(`/forecast/sales?days=${days}`);
    console.log('Sales forecast response:', response.data);
    return response.data;
  },

  getRevenueForecast: async (days: number = 30) => {
    console.log(`Getting revenue forecast for ${days} days`);
    const response = await api.get(`/forecast/revenue?days=${days}`);
    console.log('Revenue forecast response:', response.data);
    return response.data;
  },

  getDashboardForecast: async () => {
    console.log('Getting dashboard forecast');
    const response = await api.get('/forecast/dashboard');
    console.log('Dashboard forecast response:', response.data);
    return response.data;
  }
};

// Partnership API
export const partnershipAPI = {
  createPartnershipRequest: async (sellerId: string) => {
    console.log('Creating partnership request for seller:', sellerId);
    const response = await api.post('/partnerships/request', { sellerId });
    console.log('Partnership request response:', response.data);
    return response.data;
  },

  updatePartnershipStatus: async (partnershipId: string, status: 'active' | 'rejected') => {
    console.log(`Updating partnership ${partnershipId} status to ${status}`);
    const response = await api.put(`/partnerships/${partnershipId}/status`, { status });
    console.log('Partnership status update response:', response.data);
    return response.data;
  },

  getPartnerships: async (status?: string) => {
    console.log('Getting partnerships');
    const url = status ? `/partnerships?status=${status}` : '/partnerships';
    const response = await api.get(url);
    console.log('Partnerships response:', response.data);
    return response.data;
  },

  getAvailableSellers: async () => {
    console.log('Getting available sellers');
    const response = await api.get('/partnerships/available-sellers');
    console.log('Available sellers response:', response.data);
    return response.data;
  },

  getPartnershipDetails: async (partnershipId: string) => {
    console.log(`Getting details for partnership ${partnershipId}`);
    const response = await api.get(`/partnerships/${partnershipId}`);
    console.log('Partnership details response:', response.data);
    return response.data;
  }
};

// Product Request API
export const productRequestAPI = {
  createProductRequest: async (partnershipId: string, products: any[], notes?: string) => {
    console.log('Creating product request for partnership:', partnershipId);
    const response = await api.post('/product-requests', {
      partnershipId,
      products,
      notes
    });
    console.log('Product request response:', response.data);
    return response.data;
  },

  updateProductRequestStatus: async (requestId: string, status: 'approved' | 'rejected', productUpdates?: any[]) => {
    console.log(`Updating product request ${requestId} status to ${status}`);
    console.log('Product updates:', productUpdates);
    const response = await api.put(`/product-requests/${requestId}/status`, {
      status,
      productUpdates
    });
    console.log('Product request status update response:', response.data);
    return response.data;
  },

  fulfillProductRequest: async (requestId: string) => {
    console.log(`Fulfilling product request ${requestId}`);
    const response = await api.post(`/product-requests/${requestId}/fulfill`);
    console.log('Product request fulfillment response:', response.data);
    return response.data;
  },

  getProductRequests: async (status?: string) => {
    console.log('Getting product requests');
    const url = status ? `/product-requests?status=${status}` : '/product-requests';
    const response = await api.get(url);
    console.log('Product requests response:', response.data);
    return response.data;
  },

  getProductRequestDetails: async (requestId: string) => {
    console.log(`Getting details for product request ${requestId}`);
    const response = await api.get(`/product-requests/${requestId}`);
    console.log('Product request details response:', response.data);
    return response.data;
  }
};

// Message API
export const messageAPI = {
  sendMessage: async (partnershipId: string, content: string) => {
    console.log('Sending message to partnership:', partnershipId);
    const response = await api.post('/messages', { partnershipId, content });
    console.log('Message response:', response.data);
    return response.data;
  },

  getMessages: async (partnershipId: string) => {
    console.log(`Getting messages for partnership ${partnershipId}`);
    const response = await api.get(`/messages/partnership/${partnershipId}`);
    console.log('Messages response:', response.data);
    return response.data;
  }
};

// Retailer API
export const retailerAPI = {
  getInventory: async () => {
    console.log('Getting retailer inventory');
    const response = await api.get('/retailer/inventory');
    console.log('Retailer inventory response:', response.data);
    return response.data;
  },

  updateInventoryItem: async (itemId: string, updates: { price?: number, threshold?: number }) => {
    console.log(`Updating inventory item ${itemId}`);
    const response = await api.put(`/retailer/inventory/${itemId}`, updates);
    console.log('Inventory update response:', response.data);
    return response.data;
  },

  recordSale: async (productId: string, quantity: number) => {
    console.log(`Recording sale of ${quantity} units of product ${productId}`);
    const response = await api.post('/retailer/sales', { productId, quantity });
    console.log('Sale record response:', response.data);
    return response.data;
  },

  getSales: async (startDate?: string, endDate?: string) => {
    console.log('Getting retailer sales');
    let url = '/retailer/sales';
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate}`;
      if (startDate && endDate) url += '&';
      if (endDate) url += `endDate=${endDate}`;
    }
    const response = await api.get(url);
    console.log('Retailer sales response:', response.data);
    return response.data;
  },

  getForecast: async (days: number = 30) => {
    console.log(`Getting retailer forecast for ${days} days`);
    const response = await api.get(`/retailer/forecast?days=${days}`);
    console.log('Retailer forecast response:', response.data);
    return response.data;
  },

  getDashboardData: async () => {
    console.log('Getting retailer dashboard data');
    const response = await api.get('/retailer/dashboard');
    console.log('Retailer dashboard data response:', response.data);
    return response.data;
  },

  testAddInventory: async (sellerId?: string) => {
    console.log('Adding test inventory item');
    const response = await api.post('/retailer/test-add-inventory', { sellerId });
    console.log('Test inventory response:', response.data);
    return response.data;
  }
};

export default api;