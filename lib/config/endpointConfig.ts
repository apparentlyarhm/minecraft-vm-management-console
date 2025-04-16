if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("❌ ERROR: NEXT_PUBLIC_BASE_URL is not set. Please check your environment variables.");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const API_ENDPOINTS = {
  IP: `${BASE_URL}/api/v2/firewall/add-ip`,
  PING: `${BASE_URL}/api/v2/ping`,
  FIREWALL: `${BASE_URL}/api/v2/firewall`,
  MACHINE: `${BASE_URL}/api/v2/machine`,
  MOTD: `${BASE_URL}/api/v2/server-info`,
};

export default API_ENDPOINTS;
