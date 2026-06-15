import { API_URL } from "@/lib/config";

const TOKEN_KEY = "resqnet.token";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface CreateResourceInput {
  name: string;
  type: string;
  description?: string;
  state: string;
  district: string;
}

export interface UpdateResourceInput {
  name?: string;
  type?: string;
  description?: string;
  state?: string;
  district?: string;
}

export const resourceService = {
  async getResources(filters?: {
    status?: string;
    type?: string;
    state?: string;
    district?: string;
    assignedIncident?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.state) params.append("state", filters.state);
    if (filters?.district) params.append("district", filters.district);
    if (filters?.assignedIncident) params.append("assignedIncident", filters.assignedIncident);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_URL}/api/resources${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch resources");
    }
    return res.json();
  },

  async getResourceById(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/resources/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch resource details");
    }
    return res.json();
  },

  async createResource(input: CreateResourceInput): Promise<any> {
    const res = await fetch(`${API_URL}/api/resources`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create resource");
    }
    return res.json();
  },

  async updateResource(id: string, input: UpdateResourceInput): Promise<any> {
    const res = await fetch(`${API_URL}/api/resources/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update resource");
    }
    return res.json();
  },

  async updateResourceStatus(id: string, status: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/resources/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update resource status");
    }
    return res.json();
  },

  async releaseResource(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/resources/${id}/release`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to release resource");
    }
    return res.json();
  },

  async deleteResource(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/resources/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to delete resource");
    }
    return res.json();
  },
};
