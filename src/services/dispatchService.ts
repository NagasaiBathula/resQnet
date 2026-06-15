import { API_URL } from "@/lib/config";

const TOKEN_KEY = "resqnet.token";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const dispatchService = {
  async allocateResources(incidentId: string, resourceIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/api/incidents/${incidentId}/resources`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ resourceIds, release: false }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to allocate resources");
    }
    return res.json();
  },

  async releaseResources(incidentId: string, resourceIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/api/incidents/${incidentId}/resources`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ resourceIds, release: true }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to release resources");
    }
    return res.json();
  },
};
