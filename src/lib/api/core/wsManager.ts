import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');

class WebSocketManager {
    private ws: WebSocket | null = null;
    private visitorId: string;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private messageQueue: any[] = [];
    private listeners: Map<string, Set<Function>> = new Map();

    private state: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';

    constructor() {
        this.visitorId = this.getOrCreateVisitorId();
    }

    // LIFECYCLE: Connect to ws
    connect() {
        if (this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
            return this.ws
        }

        if (this.state === 'connecting') {
            return this.ws
        }

        this.state = 'connecting';
        this.ws = new WebSocket(`${WS_URL}/chat/ws?visitor_id=${this.visitorId}`);
        this.setupEventHandlers();
        return this.ws;
    }

    // LIFECYCLE: Setup ws event handlers
    setupEventHandlers() {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('Websocket connecter');
            this.state = 'connected';
            this.reconnectAttempts = 0

            // heartbeat
            this.startHeartbeat();
            this.flushMessageQueue();
            this.emit('connected');
        }

        this.ws.onmessage = (e: MessageEvent) => {
            const data = JSON.parse(e.data);

            if (data.type === 'pong') {
                console.log('Heartbeat pong received')
                return;
            }

            this.emit('message', data);
        }

        this.ws.onclose = (e: CloseEvent) => {
            console.log('Websocket closed', e.code, e.reason);
            this.state = 'disconnected';
            this.stopHeartbeat();

            this.handleReconnection();

            this.emit('disconnected', e);
        }

        this.ws.onerror = (e: Event) => {
            console.error('Websocket error', e);
            this.emit('error', e);
        }
    }

    // HEARTBEAT
    private startHeartbeat() {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                console.log('Sending heartbeat ping');
                this.ws.send(JSON.stringify({ type: 'ping' }))

                setTimeout(() => {
                    if (this.ws?.readyState !== WebSocket.OPEN) {
                        console.log('No pong received, connection might be dead');
                        this.ws?.close();
                        this.handleReconnection();
                    }
                }, 5000);
            }
        }, 30000);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // RECONNECTION
    private handleReconnection() {
        if (this.state === 'reconnecting') return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reacherd');
            this.emit('reconnectFailed');
            return;
        }

        this.state = 'reconnecting';
        this.reconnectAttempts++;

        // exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts -1), 16000);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    // MESSAGE QUEUE
    send(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.log('Websocket not connected, queueing message');
            this.messageQueue.push(message);
            
            if (this.state === 'disconnected') this.connect();
        }
    }

    private flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            this.ws.send(JSON.stringify(message));
        }
    }

    on(e: string, callback: Function) {
        if (!this.listeners.has(e)) {
            this.listeners.get(e)!.add(callback);
        }
        this.listeners.get(e)!.add(callback);

        // unsubscribe
        return () => {
            this.listeners.get(e)?.delete(callback);
        }
    }

    private emit(e: string, data?: any) {
        this.listeners.get(e)?.forEach(callback => {
            callback(data);
        });
    }

    // CLEANUP: close connection
    disconnect() {
        this.stopHeartbeat();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this.ws) {
            this.ws.close(1000, 'Client disconnecting');
            this.ws = null;
        }

        this.state = 'disconnected';
        this.messageQueue = [];
    }

    // GET STATE
    getState() {
        return {
            state: this.state,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            isConnected: this.ws?.readyState === WebSocket.OPEN
        }
    }

    private getOrCreateVisitorId() {
        let id = localStorage.getItem('visitor_id');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('visitor_id', id);
        }
        return id;
    }
}

export const wsManager = new WebSocketManager();