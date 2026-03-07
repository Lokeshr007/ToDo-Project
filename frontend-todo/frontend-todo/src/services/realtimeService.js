import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class RealtimeService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
        this.connected = false;
    }

    connect(onConnected) {
        if (this.connected || (this.stompClient && this.stompClient.connected)) {
            if (onConnected) onConnected();
            return;
        }

        // Prevent multiple simultaneous connection attempts
        if (this.connecting) return;
        this.connecting = true;

        const socket = new SockJS(`${API_BASE_URL}/ws`);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null; // Disable logging

        this.stompClient.connect({}, (frame) => {
            this.connected = true;
            this.connecting = false;
            console.log('Connected to WebSocket');
            if (onConnected) onConnected();
        }, (error) => {
            console.error('WebSocket Error:', error);
            this.connected = false;
            this.connecting = false;
            // Retry after 5 seconds if not explicitly disconnected
            if (this.stompClient) {
                setTimeout(() => this.connect(onConnected), 5000);
            }
        });
    }

    subscribe(topic, callback) {
        // If already subscribed, don't duplicate
        if (this.subscriptions.has(topic)) {
            return this.subscriptions.get(topic);
        }

        if (!this.stompClient || !this.connected || !this.stompClient.connected) {
            // Queue subscription if not connected
            setTimeout(() => this.subscribe(topic, callback), 1000);
            return;
        }

        try {
            const subscription = this.stompClient.subscribe(topic, (message) => {
                if (callback) {
                    try {
                        callback(JSON.parse(message.body));
                    } catch (e) {
                        console.error('Error parsing WebSocket message:', e);
                    }
                }
            });

            this.subscriptions.set(topic, subscription);
            return subscription;
        } catch (error) {
            console.error('Subscription error:', error);
            setTimeout(() => this.subscribe(topic, callback), 2000);
        }
    }

    unsubscribe(topic) {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            try {
                subscription.unsubscribe();
            } catch (e) {
                console.warn('Unsubscribe error:', e);
            }
            this.subscriptions.delete(topic);
        }
    }

    disconnect() {
        if (this.stompClient) {
            try {
                // Only disconnect if actually connected
                if (this.stompClient.connected) {
                    this.stompClient.disconnect();
                }
            } catch (e) {
                console.warn('Disconnect error:', e);
            }
            this.stompClient = null;
            this.connected = false;
            this.connecting = false;
            this.subscriptions.clear();
        }
    }
}

const realtimeService = new RealtimeService();
export default realtimeService;
