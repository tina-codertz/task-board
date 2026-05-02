import { getToken } from "./api";

const API_BASE_URL = "http://192.168.1.8:8000/api";

// Helper function to make authenticated requests
async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(`[API] No token available for ${endpoint}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.error(`[API] Unauthorized response from ${endpoint}. Token: ${token ? "present" : "missing"}`);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Admin APIs
export const adminAPI = {
  async getAllUsers() {
    return authenticatedFetch("/admin/users");
  },

  async getUserById(id: number) {
    return authenticatedFetch(`/admin/users/${id}`);
  },

  async createUser(userData: any) {
    return authenticatedFetch("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async updateUserRole(id: number, role: string) {
    return authenticatedFetch(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async getActivityLogs() {
    return authenticatedFetch("/activity-logs");
  },

  async deleteUser(id: number) {
    return authenticatedFetch(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },
};

// Task APIs
export const taskAPI = {
  async getAllTasks() {
    return authenticatedFetch("/tasks");
  },

  async getCreatedTasks() {
    return authenticatedFetch("/tasks/created");
  },

  async getAssignedTasks() {
    return authenticatedFetch("/tasks/assigned");
  },

  async getTeamTasks(teamId: number) {
    return authenticatedFetch(`/tasks/team/${teamId}`);
  },

  async getTaskById(id: number) {
    return authenticatedFetch(`/tasks/${id}`);
  },

  async createTask(taskData: any) {
    return authenticatedFetch("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(id: number, taskData: any) {
    return authenticatedFetch(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(taskData),
    });
  },

  async updateTaskStatus(id: number, status: string) {
    return authenticatedFetch(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async deleteTask(id: number) {
    return authenticatedFetch(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  // Comment methods
  async getTaskComments(taskId: number) {
    return authenticatedFetch(`/tasks/${taskId}/comments`);
  },

  async addComment(taskId: number, content: string) {
    return authenticatedFetch(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  async updateComment(commentId: number, content: string) {
    return authenticatedFetch(`/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(commentId: number) {
    return authenticatedFetch(`/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};

// Team APIs
export const teamAPI = {
  async getAllTeams() {
    return authenticatedFetch("/teams");
  },

  async getMyTeams() {
    return authenticatedFetch("/teams/owner/my-teams");
  },

  async getTeamById(id: number) {
    return authenticatedFetch(`/teams/${id}`);
  },

  async createTeam(teamData: any) {
    return authenticatedFetch("/teams", {
      method: "POST",
      body: JSON.stringify(teamData),
    });
  },

  async addTeamMember(teamId: number, memberId: number) {
    return authenticatedFetch(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify({ memberId }),
    });
  },

  async deleteTeam(id: number) {
    return authenticatedFetch(`/teams/${id}`, {
      method: "DELETE",
    });
  },
};

// Auth APIs
export const authAPI = {
  async getProfile() {
    return authenticatedFetch("/auth/me");
  },

  async updateProfile(data: any) {
    return authenticatedFetch("/auth/update-profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getAllUsers() {
    return authenticatedFetch("/auth/users");
  },
};
