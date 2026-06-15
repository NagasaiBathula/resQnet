import { API_URL } from "@/lib/config";
import { Incident } from "@/lib/mock-data";

const TOKEN_KEY = "resqnet.token";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface CreateIncidentInput {
  title: string;
  description: string;
  category: string;
  severity: string;
  coordinates: { lat: number; lng: number };
  state: string;
  district: string;
  address?: string;
  attachments?: { fileName: string; fileType: string }[];
}

export const incidentService = {
  async createIncident(input: CreateIncidentInput): Promise<Incident> {
    const res = await fetch(`${API_URL}/api/incidents`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create incident");
    }
    return res.json();
  },

  async getIncidents(filters?: {
    status?: string;
    category?: string;
    severity?: string;
  }): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.severity) params.append("severity", filters.severity);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_URL}/api/incidents${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch incidents");
    }
    return res.json();
  },

  async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`${API_URL}/api/incidents/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch incident details");
    }
    return res.json();
  },

  async getMyIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_URL}/api/incidents/my`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch my incidents");
    }
    return res.json();
  },

  async updateIncidentStatus(
    id: string,
    status: string,
    resolutionNotes?: string,
  ): Promise<Incident> {
    const res = await fetch(`${API_URL}/api/incidents/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, resolutionNotes }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update status");
    }
    return res.json();
  },

  async assignIncident(
    id: string,
    payload: { assignedRescueTeam?: string; assignedVolunteers?: string[] },
  ): Promise<Incident> {
    const res = await fetch(`${API_URL}/api/incidents/${id}/assign`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to assign responders");
    }
    return res.json();
  },
};
