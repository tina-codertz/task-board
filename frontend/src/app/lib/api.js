const API_URL = import.meta.env.VITE_API_URL;

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Common headers
const getHeaders = (contentType = 'application/json') => ({
  'Content-Type': contentType,
  'Authorization': `Bearer ${getToken()}`,
});

//auth endpoints
export const authAPI = {
  register: (name, email, password) =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  getProfile: () =>
    fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  updateProfile: (name, email, currentPassword, newPassword) =>
    fetch(`${API_URL}/auth/update-profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        name,
        email,
        currentPassword,
        newPassword,
      }),
    }).then(r => r.json()),
};


// TASK ENDPOINTS

export const taskAPI = {
  createTask: (title, description, status, teamId, assignedToId) =>
    fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, status, teamId, assignedToId }),
    }).then(r => r.json()),

  getAllTasks: () =>
    fetch(`${API_URL}/tasks`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getAssignedTasks: () =>
    fetch(`${API_URL}/tasks/assigned`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getTaskById: (taskId) =>
    fetch(`${API_URL}/tasks/${taskId}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  updateTask: (taskId, title, description, status, assignedToId) =>
    fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, status, assignedToId }),
    }).then(r => r.json()),

  updateTaskStatus: (taskId, status) =>
    fetch(`${API_URL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(r => r.json()),

  deleteTask: (taskId) =>
    fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(r => r.json()),

  getTasksByTeam: (teamId) =>
    fetch(`${API_URL}/tasks/team/${teamId}`, {
      headers: getHeaders(),
    }).then(r => r.json()),
};


// TEAM ENDPOINTS

export const teamAPI = {
  createTeam: (name, description) =>
    fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description }),
    }).then(r => r.json()),

  getAllTeams: () =>
    fetch(`${API_URL}/teams`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getTeamById: (teamId) =>
    fetch(`${API_URL}/teams/${teamId}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  updateTeam: (teamId, name, description) =>
    fetch(`${API_URL}/teams/${teamId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ name, description }),
    }).then(r => r.json()),

  deleteTeam: (teamId) =>
    fetch(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(r => r.json()),

  addMember: (teamId, userId) =>
    fetch(`${API_URL}/teams/${teamId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId }),
    }).then(r => r.json()),

  removeMember: (teamId, memberId) =>
    fetch(`${API_URL}/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(r => r.json()),

  getMyTeams: () =>
    fetch(`${API_URL}/teams/owner/my-teams`, {
      headers: getHeaders(),
    }).then(r => r.json()),
};


// COMMENT ENDPOINTS

export const commentAPI = {
  addComment: (taskId, content) =>
    fetch(`${API_URL}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    }).then(r => r.json()),

  getComments: (taskId) =>
    fetch(`${API_URL}/tasks/${taskId}/comments`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  deleteComment: (commentId) =>
    fetch(`${API_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(r => r.json()),

  updateComment: (commentId, content) =>
    fetch(`${API_URL}/comments/${commentId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    }).then(r => r.json()),
};


// ADMIN ENDPOINTS

export const adminAPI = {
  getAllUsers: () =>
    fetch(`${API_URL}/admin/users`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getUserById: (userId) =>
    fetch(`${API_URL}/admin/users/${userId}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  updateUserRole: (userId, role) =>
    fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    }).then(r => r.json()),

  deleteUser: (userId) =>
    fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(r => r.json()),

  createUser: (name, email, password, role) =>
    fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, role }),
    }).then(r => r.json()),
};

// ACTIVITY LOG ENDPOINTS

export const activityLogAPI = {
  getAllLogs: () =>
    fetch(`${API_URL}/activity-logs`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getUserLogs: (userId) =>
    fetch(`${API_URL}/activity-logs/user/${userId}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getTaskLogs: (taskId) =>
    fetch(`${API_URL}/activity-logs/task/${taskId}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getLogsByAction: (action) =>
    fetch(`${API_URL}/activity-logs/action/${action}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getLogsDateRange: (startDate, endDate) =>
    fetch(`${API_URL}/activity-logs/date-range?startDate=${startDate}&endDate=${endDate}`, {
      headers: getHeaders(),
    }).then(r => r.json()),
};


// EXPORT ALL APIS

export default {
  auth: authAPI,
  task: taskAPI,
  team: teamAPI,
  comment: commentAPI,
  admin: adminAPI,
  activityLog: activityLogAPI,
};
