const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com"; // Default to production

export const API_ENDPOINTS = {
  IP: `${BASE_URL}/api/v2/firewall/add-ip`,
  FIREWALL: `${BASE_URL}/api/v2/firewall`,
  MACHINE: `${BASE_URL}/api/v2/machine`,
  MOTD: `${BASE_URL}/api/v2/server-info`,
};

export default API_ENDPOINTS;
