import API_ENDPOINTS from "../config/endpointConfig";

export const isServerUp = async (): Promise<boolean> => { 
    try {
        const response = await fetch(API_ENDPOINTS.PING);
        return response.status === 200;
    } catch (error) {
        return false; 
    }
};