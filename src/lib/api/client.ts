const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}
class ApiClient {
    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_URL}/api/v1${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            throw new ApiError(response.status, await response.text());
        }

        return response.json();

    }
    
    get(endpoint: string) {
        return this.request(endpoint);
    }

    post(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const apiClient = new ApiClient();