
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_BASE_URL } from "@/utils/api.config";
import type { Message, MessageRequest } from "@/types/chat.type";

console.log("📦 WebSocketService module loaded");
console.log("WS_BASE_URL at module load:", WS_BASE_URL);

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscriptions: Map<number, any[]> = new Map();

  private getWsUrl(): string {
    console.log("🔍 getWsUrl() called");
    console.log("WS_BASE_URL:", WS_BASE_URL);
    
    // Sử dụng trực tiếp WS_BASE_URL từ config
    const wsUrl = WS_BASE_URL;
    console.log("WebSocket URL:", wsUrl);
    return wsUrl;
  }

  async connect(onConnected?: () => void, onError?: (error: any) => void) {
    console.log("🔌 connect() called");
    console.log("Current state - isConnected:", this.isConnected, "client.active:", this.client?.active);
    
    if (this.isConnected && this.client?.active) {
      console.log("WebSocket already connected");
      onConnected?.();
      return;
    }

    if (this.client && this.client.active) {
      console.log("WebSocket connection in progress...");
      return;
    }

    // Disconnect existing client if any
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.log("Error deactivating existing client:", e);
      }
      this.client = null;
    }

    const wsUrl = this.getWsUrl();
    console.log("=== WebSocket Connection ===");
    console.log("Connecting to:", wsUrl);
    console.log("WS Base URL:", WS_BASE_URL);

    try {
      // Dùng SockJS như web version - tương thích tốt hơn với React Native
      this.client = new Client({
        webSocketFactory: () => {
          console.log("Creating SockJS connection to:", wsUrl);
          return new SockJS(wsUrl) as any;
        },
        // Không gửi Authorization header trong CONNECT frame (giống web version)
        connectHeaders: {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          if (__DEV__) {
            console.log("STOMP Debug:", str);
            // Log CONNECTED frame specifically
            if (str.includes("CONNECTED") || str.includes("CONNECT_ACK")) {
              console.log("🎉 STOMP CONNECTED frame received from server!");
              console.log("🎉 Full CONNECTED message:", str);
            }
            // Log ERROR frame
            if (str.includes("ERROR")) {
              console.error("🚨 STOMP ERROR frame received:", str);
            }
            // Log tất cả incoming messages
            if (str.includes("<<<") || str.includes("<<< CONNECTED")) {
              console.log("📥 STOMP Incoming message:", str);
            }
          }
        },
        onConnect: (frame) => {
          console.log("✅ STOMP WebSocket Connected successfully");
          console.log("CONNECTED frame:", frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          onConnected?.();
        },
        onStompError: (frame) => {
          console.error("❌ STOMP Error Frame received:");
          console.error("Command:", frame.command);
          console.error("Headers:", JSON.stringify(frame.headers, null, 2));
          console.error("Body:", frame.body);
          this.isConnected = false;
          if (onError) {
            onError(frame);
          }
        },
        onWebSocketClose: (event) => {
          console.log("WebSocket Closed:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          this.isConnected = false;

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(
              `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );
            setTimeout(() => {
              this.connect(onConnected, onError);
            }, 5000);
          } else {
            console.error("Max reconnection attempts reached");
          }
        },
        onWebSocketError: (error) => {
          console.error("❌ WebSocket Error:", error);
          this.isConnected = false;
          if (onError) {
            onError(error);
          }
        },
        onDisconnect: () => {
          console.log("STOMP Disconnected");
          this.isConnected = false;
        },
      });

      console.log("Activating STOMP client...");
      this.client.activate();
      
      // Timeout check: nếu sau 10 giây không có CONNECTED, log warning
      setTimeout(() => {
        if (!this.isConnected && this.client?.active) {
          console.warn("⚠️ WebSocket opened but no CONNECTED frame received after 10 seconds");
          console.warn("Client state:", {
            active: this.client.active,
            connected: this.isConnected,
            wsReadyState: (this.client as any).ws?.readyState,
          });
        }
      }, 10000);
    } catch (error) {
      console.error("❌ Error creating STOMP client:", error);
      this.isConnected = false;
      if (onError) {
        onError(error);
      }
    }
  }

  subscribeToChatRoom(
    chatId: number,
    onMessageReceived: (message: Message) => void
  ) {
    if (!this.client) {
      console.error("STOMP client not initialized");
      return null;
    }

    if (!this.isConnected || !this.client.active) {
      console.error("WebSocket not connected. Client active:", this.client.active, "isConnected:", this.isConnected);
      return null;
    }

    try {
      const subscription = this.client.subscribe(
        `/topic/chat/${chatId}`,
        (message: IMessage) => {
          try {
            const receivedMessage = JSON.parse(message.body) as Message;
            console.log("Received message:", receivedMessage);
            onMessageReceived(receivedMessage);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        }
      );

      if (!this.subscriptions.has(chatId)) {
        this.subscriptions.set(chatId, []);
      }
      this.subscriptions.get(chatId)?.push(subscription);

      console.log(
        `✅ Subscribed to chat ${chatId}, total subscriptions: ${this.subscriptions.get(chatId)?.length}`
      );

      return subscription;
    } catch (error) {
      console.error("Error subscribing to chat room:", error);
      return null;
    }
  }

  unsubscribeFromChat(chatId: number) {
    const subscriptions = this.subscriptions.get(chatId);
    if (subscriptions) {
      subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.delete(chatId);
      console.log(`Unsubscribed from chat ${chatId}`);
    }
  }

  unsubscribeFromAllChats() {
    this.subscriptions.forEach((subscriptions) => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    });
    this.subscriptions.clear();
  }

  sendMessage(messageRequest: MessageRequest) {
    if (!this.client || !this.isConnected) {
      console.error("WebSocket not connected");
      return;
    }

    try {
      this.client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(messageRequest),
      });
      console.log("Message sent:", messageRequest);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  disconnect() {
    if (this.client) {
      this.unsubscribeFromAllChats();
      this.client.deactivate();
      this.isConnected = false;
      console.log("WebSocket Disconnected");
    }
  }

  isWebSocketConnected() {
    return this.isConnected && this.client?.active;
  }
}

export const webSocketService = new WebSocketService();
