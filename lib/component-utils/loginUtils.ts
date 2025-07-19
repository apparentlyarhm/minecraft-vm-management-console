import API_ENDPOINTS from "../config/endpointConfig";

interface LoginUrlResponse {
  message: string;
}

export async function initiateLogin(): Promise<void> {
  try {
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch login URL' }));
      throw new Error(err.message);
    }
    const data: LoginUrlResponse = await res.json();
    window.location.href = data.message;

  } catch (error) {
    console.error("Login initiation failed:", error);
    alert("Could not start the login process. Please try again.");
  }
}