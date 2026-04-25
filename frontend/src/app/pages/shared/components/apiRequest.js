/**
 * Generic API request handler for dashboard components
 * Automatically injects JWT token and handles common response patterns
 * @param {string} path - API endpoint path (e.g., '/tasks', '/teams/1')
 * @param {object} options - Request options { method, body, headers, public }
 * @returns {Promise<object>} Parsed JSON response
 */
export const apiRequest = async (path, options = {}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  const {
    method = 'GET',
    body = undefined,
    headers = {},
    public: isPublic = false,
  } = options;

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Inject JWT token for protected endpoints
  if (!isPublic) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Request Failed [${method} ${path}]:`, error);
    throw error;
  }
};

/**
 * Convenience shortcuts for common HTTP methods
 */
export const apiGet = (path) => apiRequest(path, { method: 'GET' });
export const apiPost = (path, body) => apiRequest(path, { method: 'POST', body });
export const apiPatch = (path, body) => apiRequest(path, { method: 'PATCH', body });
export const apiDelete = (path) => apiRequest(path, { method: 'DELETE' });
