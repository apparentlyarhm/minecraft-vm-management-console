const BASE_URL = "https://mc-validator-xrnd65hd7a-as.a.run.app";

export const API_ENDPOINTS = {
  IP: `${BASE_URL}/api/v2/firewall/add-ip`,
  FIREWALL: `${BASE_URL}/api/v2/firewall`,
  MACHINE: `${BASE_URL}/api/v2/machine`,
  MOTD: `${BASE_URL}/api/v2/server-info`,
};

export default API_ENDPOINTS;
