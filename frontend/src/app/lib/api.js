const API_URL = import.meta.env.VITE_API_URL;

// all apis from the backend are called in this page and the auth headers is injected automaticlly
//the public endpoints login/register skip the token by pasing {public:true}

const request = async (method, path, body, options = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (!options.public) {
    headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

// Shorthand verbs
const get = (path) => request("GET", path);
const post = (path, body) => request("POST", path, body);
const patch = (path, body) => request("PATCH", path, body);
const del = (path) => request("DELETE", path);
const pub = (path, body) => request("POST", path, body, { public: true });

//  Auth
export const authAPI = {
  register: (name, email, password) =>
    pub("/auth/register", { name, email, password }),
  login: (email, password) => pub("/auth/login", { email, password }),
  getProfile: () => get("/auth/me"),
  updateProfile: (name, email, currentPassword, newPassword) =>
    patch("/auth/update-profile", {
      name,
      email,
      currentPassword,
      newPassword,
    }),
      getAllUsers: () => get("/auth/users"),
};

// Tasks
export const taskAPI = {
  createTask: (title, description, status, teamId, assignedToId) =>
    post("/tasks", { title, description, status, teamId, assignedToId }),
  getAllTasks: () => get("/tasks"),
  getAssignedTasks: () => get("/tasks/assigned"),
  getTaskById: (taskId) => get(`/tasks/${taskId}`),
  updateTask: (taskId, title, description, status, assignedToId) =>
    patch(`/tasks/${taskId}`, { title, description, status, assignedToId }),
  updateTaskStatus: (taskId, status) =>
    patch(`/tasks/${taskId}/status`, { status }),
  deleteTask: (taskId) => del(`/tasks/${taskId}`),
  getTasksByTeam: (teamId) => get(`/tasks/team/${teamId}`),
};

// ── Teams
export const teamAPI = {
  createTeam: (name, description) => post("/teams", { name, description }),
  getAllTeams: () => get("/teams"),
  getTeamById: (teamId) => get(`/teams/${teamId}`),
  updateTeam: (teamId, name, description) =>
    patch(`/teams/${teamId}`, { name, description }),
  deleteTeam: (teamId) => del(`/teams/${teamId}`),
  addMember: (teamId, userId) => post(`/teams/${teamId}/members`, { userId }),
  removeMember: (teamId, memberId) =>
    del(`/teams/${teamId}/members/${memberId}`),
  getMyTeams: () => get("/teams/owner/my-teams"),
};

// ── Comments
export const commentAPI = {
  addComment: (taskId, content) =>
    post(`/tasks/${taskId}/comments`, { content }),
  getComments: (taskId) => get(`/tasks/${taskId}/comments`),
  deleteComment: (commentId) => del(`/comments/${commentId}`),
  updateComment: (commentId, content) =>
    patch(`/comments/${commentId}`, { content }),
};

// ── Admin
export const adminAPI = {
  getAllUsers: () => get("/admin/users"),
  getUserById: (userId) => get(`/admin/users/${userId}`),
  updateUserRole: (userId, role) =>
    patch(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => del(`/admin/users/${userId}`),
  createUser: (name, email, password, role) =>
    post("/admin/users", { name, email, password, role }),
};

// ── Activity Logs
export const activityLogAPI = {
  getAllLogs: () => get("/activity-logs"),
  getUserLogs: (userId) => get(`/activity-logs/user/${userId}`),
  getTaskLogs: (taskId) => get(`/activity-logs/task/${taskId}`),
  getLogsByAction: (action) => get(`/activity-logs/action/${action}`),
  getLogsDateRange: (startDate, endDate) =>
    get(`/activity-logs/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// ── Default export
export default {
  auth: authAPI,
  task: taskAPI,
  team: teamAPI,
  comment: commentAPI,
  admin: adminAPI,
  activityLog: activityLogAPI,
};
