const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
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
    const normalizedValue = Array.isArray(value) ? value.join(',') : value;
    if (normalizedValue !== undefined && normalizedValue !== null && normalizedValue !== '') {
      searchParams.set(key, normalizedValue);
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

  copy(resource, id) {
    return request(`/api/${resource}/copy/${id}`, {
      method: 'POST',
    });
  },

  copyMany(resource, ids) {
    return request(`/api/${resource}/copy`, {
      method: 'POST',
      body: JSON.stringify({ idlist: ids.join(',') }),
    });
  },

  remove(resource, id) {
    return request(`/api/${resource}/delete/${id}`, {
      method: 'POST',
    });
  },

  removeMany(resource, ids) {
    return request(`/api/${resource}/delete`, {
      method: 'POST',
      body: JSON.stringify({ idlist: ids.join(',') }),
    });
  },

  importFile(resource, file) {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/api/${resource}/import`, {
      method: 'POST',
      body: formData,
    });
  },

  exportUrl(resource, type = 'xlsx', params) {
    const path = type === 'pdf' ? 'export_pdf' : 'export';
    return `${API_BASE_URL}/api/${resource}/${path}${queryString(params)}`;
  },
};
