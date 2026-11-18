/* =========================================
   C-L Sabores — API Client
   Base URL: http://localhost:3000
   ========================================= */

const API_BASE = 'http://localhost:3000';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Erro na requisição');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

export const menuAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/menu${qs ? '?' + qs : ''}`);
  },
  get: (id) => apiRequest(`/menu/${id}`),
  create: (data) =>
    apiRequest('/menu', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiRequest(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/menu/${id}`, { method: 'DELETE' }),
  public: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/menu/public${qs ? '?' + qs : ''}`);
  },
};

export const clientAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/clients${qs ? '?' + qs : ''}`);
  },
  get: (id) => apiRequest(`/clients/${id}`),
  create: (data) =>
    apiRequest('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiRequest(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/clients/${id}`, { method: 'DELETE' }),
};

export const ingredientAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/ingredients${qs ? '?' + qs : ''}`);
  },
  get: (id) => apiRequest(`/ingredients/${id}`),
  create: (data) =>
    apiRequest('/ingredients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiRequest(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/ingredients/${id}`, { method: 'DELETE' }),
};

export const stockAPI = {
  list: () => apiRequest('/stock'),
  low: () => apiRequest('/stock/low'),
  get: (ingredientId) => apiRequest(`/stock/${ingredientId}`),
  update: (ingredientId, data) =>
    apiRequest(`/stock/${ingredientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const recipeAPI = {
  list: () => apiRequest('/recipes'),
  get: (id) => apiRequest(`/recipes/${id}`),
  getByDish: (dishId) => apiRequest(`/recipes/dish/${dishId}`),
  create: (data) =>
    apiRequest('/recipes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiRequest(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/recipes/${id}`, { method: 'DELETE' }),
};

export const orderAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/orders${qs ? '?' + qs : ''}`);
  },
  get: (id) => apiRequest(`/orders/${id}`),
  create: (data) =>
    apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  cancel: (id) => apiRequest(`/orders/${id}/cancel`, { method: 'PATCH' }),
  remove: (id) => apiRequest(`/orders/${id}`, { method: 'DELETE' }),
};

export const statusAPI = {
  check: () => apiRequest('/status'),
};

export function saveAuth(token, employee) {
  localStorage.setItem('token', token);
  localStorage.setItem('employee', JSON.stringify(employee));
}

export function getAuth() {
  const token = localStorage.getItem('token');
  let employee = null;
  try {
    const raw = localStorage.getItem('employee');
    employee = raw ? JSON.parse(raw) : null;
  } catch {
    employee = null;
  }
  return { token, employee };
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('employee');
  window.location.replace('/');
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function hasRole(role) {
  const { employee } = getAuth();
  return employee && employee.role === role;
}

export function hasAnyRole(roles) {
  const { employee } = getAuth();
  return employee && roles.includes(employee.role);
}
