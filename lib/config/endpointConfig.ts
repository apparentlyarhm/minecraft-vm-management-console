if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("❌ ERROR: NEXT_PUBLIC_BASE_URL is not set. Please check your environment variables.");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const API_ENDPOINTS = {
  IP: `${BASE_URL}/api/v2/firewall/add-ip`,
  CHECK_IP: `${BASE_URL}/api/v2/firewall/check-ip`,
  PING: `${BASE_URL}/api/v2/ping`,
  PURGE: `${BASE_URL}/api/v2/firewall/purge`,
  FIREWALL: `${BASE_URL}/api/v2/firewall`,
  MACHINE: `${BASE_URL}/api/v2/machine`,
  MOTD: `${BASE_URL}/api/v2/server-info`,
  LOGIN: `${BASE_URL}/api/v2/auth/login`,
  CALLBACK: `${BASE_URL}/api/v2/auth/callback`,
};

export default API_ENDPOINTS;
