// API Client for Our Little Complaint Box

const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('complaint_box_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('complaint_box_token', token);
  } else {
    localStorage.removeItem('complaint_box_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  // If body is FormData, delete Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    // If token invalid/expired, clear it
    if (endpoint !== '/auth/login' && endpoint !== '/auth/quick-login') {
      setAuthToken(null);
      window.dispatchEvent(new Event('auth-logout'));
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || 'Something went wrong in our little world ♡';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: { username, password }
  }),

  quickLogin: (role) => request('/auth/quick-login', {
    method: 'POST',
    body: { role }
  }),

  getMe: () => request('/auth/me'),

  // Complaints
  getComplaints: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.sort) searchParams.append('sort', params.sort);
    const qs = searchParams.toString();
    return request(`/complaints${qs ? `?${qs}` : ''}`);
  },

  getComplaint: (id) => request(`/complaints/${id}`),

  createComplaint: (data) => request('/complaints', {
    method: 'POST',
    body: data
  }),

  updateStatus: (id, status) => request(`/complaints/${id}/status`, {
    method: 'PATCH',
    body: { status }
  }),

  // Responses
  addResponse: (complaintId, message) => request(`/complaints/${complaintId}/responses`, {
    method: 'POST',
    body: { message }
  }),

  // Reactions
  setReaction: (complaintId, reaction) => request(`/complaints/${complaintId}/reactions`, {
    method: 'POST',
    body: { reaction }
  }),

  // Memories
  getMemories: () => request('/memories'),

  addMemory: (complaintId, data) => request(`/complaints/${complaintId}/memories`, {
    method: 'POST',
    body: data
  }),

  // Stats & Corner
  getStats: () => request('/corner/stats'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),

  // File Upload
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload', {
      method: 'POST',
      body: formData
    });
  },

  // Easter Eggs
  getRandomQuote: () => request('/easter-eggs/quote')
};
