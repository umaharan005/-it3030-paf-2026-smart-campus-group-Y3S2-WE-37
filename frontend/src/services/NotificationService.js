import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class NotificationService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = [];
        this.reconnectTimer = null;
    }

    connect(userId, onNotificationReceived) {
        if (this.connected) return;

        const destination = `/topic/notifications/${encodeURIComponent(userId)}`;

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 0,
            debug: () => {}
        });

        this.stompClient.onConnect = () => {
            this.connected = true;
            console.log('Connected to WebSocket');

            const sub = this.stompClient.subscribe(destination, (message) => {
                if (message.body) {
                    onNotificationReceived(JSON.parse(message.body));
                }
            });
            this.subscriptions.push(sub);
        };

        this.stompClient.onStompError = (error) => {
            console.error('WebSocket STOMP Error:', error);
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error('WebSocket Error:', error);
        };

        this.stompClient.onWebSocketClose = () => {
            this.connected = false;
            if (!this.reconnectTimer) {
                this.reconnectTimer = setTimeout(() => {
                    this.reconnectTimer = null;
                    this.connect(userId, onNotificationReceived);
                }, 5000);
            }
        };

        this.stompClient.activate();
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.stompClient !== null) {
            this.subscriptions.forEach((sub) => sub.unsubscribe());
            this.stompClient.deactivate();
            this.stompClient = null;
        }

        this.connected = false;
        this.subscriptions = [];
        console.log('Disconnected from WebSocket');
    }
}

export default new NotificationService();
