const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const resolveBackendUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

