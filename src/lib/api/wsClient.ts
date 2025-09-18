const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export class WsClient {
    connect(visitorId: string): WebSocket {
        return new WebSocket(`${WS_URL}/api/v1/chat/ws?visitor_id=${visitorId}`);
    }
}

export const wsClient = new WsClient();