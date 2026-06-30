const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'Không thể xử lý yêu cầu');
  }

  return payload.data;
}

function queryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const api = {
  login(values) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(values),
    });
  },

  dashboardSummary() {
    return request('/api/dashboard/summary');
  },

  list(resource, params) {
    return request(`/api/${resource}/get_by_page${queryString(params)}`);
  },

  getAll(resource) {
    return request(`/api/${resource}`);
  },

  create(resource, values) {
    return request(`/api/${resource}/create`, {
      method: 'POST',
      body: JSON.stringify(values),
    });
  },

  update(resource, id, values) {
    return request(`/api/${resource}/update/${id}`, {
      method: 'POST',
      body: JSON.stringify(values),
    });
  },

  remove(resource, id) {
    return request(`/api/${resource}/delete/${id}`, {
      method: 'POST',
    });
  },

  exportUrl(resource, type = 'xlsx') {
    const path = type === 'pdf' ? 'export_pdf' : 'export';
    return `${API_BASE_URL}/api/${resource}/${path}`;
  },
};
