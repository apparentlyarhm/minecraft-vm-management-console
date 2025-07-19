import API_ENDPOINTS from "../config/endpointConfig";
import { initiateLogin } from "./loginUtils";

type AddressAddRequest = {
  address: string;
  passcode: string;
};

export async function addIpToFirewall(
  request: AddressAddRequest
): Promise<{ message: string }> {
  const res = await fetch(API_ENDPOINTS.IP, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to add IP');
  }

  return res.json();
}


export async function checkIpInFirewall(ip: string): Promise<{ message: string }> {
  const res = await fetch(`${API_ENDPOINTS.CHECK_IP}?ip=${encodeURIComponent(ip)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to check IP');
  }

  return res.json();
}

export async function purgeFirewall(
  token: string
): Promise<{ message: string }> {
  const res = await fetch(API_ENDPOINTS.PURGE, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,    
},
  });

  if (res.status === 401 ) {
    // 401 always means that we need to login
    await initiateLogin()
  }

  const data = await res.json()
  if (res.status === 403){
    // server knows who we are, we are just not allowed to do this operation.
    throw new Error(data["message"]);
  }

  if (!res.ok) {
    throw new Error(data.message || 'Failed to purge firewall');
  }

  return data;
}
