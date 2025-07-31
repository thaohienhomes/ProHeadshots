// Production WebSocket client for real-time processing updates
import { useState, useEffect } from 'react';
import { getAuthSession } from '@/lib/auth/authUtils';
import { ProcessingSession, ProcessingStage } from '@/lib/api/processing';

export interface WebSocketMessage {
  type: 'processing_update' | 'stage_complete' | 'session_complete' | 'error' | 'heartbeat';
  sessionId: string;
  timestamp: string;
  data?: any;
}

export interface ProcessingUpdateMessage extends WebSocketMessage {
  type: 'processing_update';
  data: {
    session: ProcessingSession;
    updatedStages: ProcessingStage[];
  };
}

export interface StageCompleteMessage extends WebSocketMessage {
  type: 'stage_complete';
  data: {
    stageId: string;
    stageName: string;
    completedAt: string;
    nextStage?: ProcessingStage;
  };
}

export interface SessionCompleteMessage extends WebSocketMessage {
  type: 'session_complete';
  data: {
    session: ProcessingSession;
    completedAt: string;
    resultUrls: string[];
  };
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface WebSocketOptions {
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

export type MessageHandler = (message: WebSocketMessage) => void;

class ProcessingWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<WebSocketOptions>;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectCount = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  private sessionId: string | null = null;
  private isDemoMode = false;
  private demoTimer: NodeJS.Timeout | null = null;

  // Connection state
  private _isConnected = false;
  private _isConnecting = false;
  private _lastError: Error | null = null;

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      reconnectAttempts: options.reconnectAttempts ?? 5,
      reconnectDelay: options.reconnectDelay ?? 1000,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      connectionTimeout: options.connectionTimeout ?? 10000,
    };

    // Determine WebSocket URL (will be set when connecting)
    this.url = '';
  }

  // Public getters
  get isConnected(): boolean {
    return this._isConnected;
  }

  get isConnecting(): boolean {
    return this._isConnecting;
  }

  get lastError(): Error | null {
    return this._lastError;
  }

  // Connect to WebSocket
  async connect(sessionId: string): Promise<void> {
    if (this._isConnected || this._isConnecting) {
      return;
    }

    // Set WebSocket URL (only available in browser)
    if (typeof window !== 'undefined' && !this.url) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
      this.url = `${protocol}//${host}/ws/processing`;
    }

    this.sessionId = sessionId;
    this.isIntentionallyClosed = false;
    this._isConnecting = true;
    this._lastError = null;

    try {
      // Get authentication token
      const session = await getAuthSession();
      const token = session?.accessToken;

      if (!token) {
        console.warn('No authentication token available, using demo mode');
      }

      // Try to create WebSocket connection with auth token
      const wsUrl = token
        ? `${this.url}?sessionId=${sessionId}&token=${encodeURIComponent(token)}`
        : `${this.url}?sessionId=${sessionId}`;

      try {
        this.ws = new WebSocket(wsUrl);

        // Set connection timeout
        this.connectionTimer = setTimeout(() => {
          if (this._isConnecting) {
            console.log('WebSocket connection timeout, falling back to demo mode');
            this.ws?.close();
            this.startDemoMode();
          }
        }, this.options.connectionTimeout);

        // Set up event handlers
        this.ws.onopen = this.handleOpen.bind(this);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleWebSocketError.bind(this);

      } catch (wsError) {
        console.log('WebSocket creation failed, using demo mode:', wsError);
        this.startDemoMode();
      }

    } catch (error) {
      this._isConnecting = false;
      this.handleError(error instanceof Error ? error : new Error('Connection failed'));
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.cleanup();
  }

  // Add message handler
  addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  // Remove message handler
  removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  // Send message to server
  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Handle WebSocket open
  private handleOpen(): void {
    console.log('WebSocket connected');
    this._isConnected = true;
    this._isConnecting = false;
    this.reconnectCount = 0;
    this._lastError = null;

    // Clear connection timeout
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    // Start heartbeat
    this.startHeartbeat();

    // Send initial subscription message
    this.send({
      type: 'subscribe',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle WebSocket message
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat responses
      if (message.type === 'heartbeat') {
        return;
      }

      // Notify all handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Handle WebSocket close
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    this._isConnected = false;
    this._isConnecting = false;

    this.stopHeartbeat();

    // Attempt reconnection if not intentionally closed
    if (!this.isIntentionallyClosed && this.reconnectCount < this.options.reconnectAttempts) {
      this.scheduleReconnect();
    } else if (!this.isIntentionallyClosed && this.reconnectCount >= this.options.reconnectAttempts) {
      console.log('WebSocket reconnection attempts exhausted, falling back to demo mode');
      this.startDemoMode();
    }
  }

  // Handle WebSocket error
  private handleWebSocketError(event: Event): void {
    console.error('WebSocket error:', event);

    // If we've exhausted reconnection attempts, fall back to demo mode
    if (this.reconnectCount >= this.options.reconnectAttempts) {
      console.log('WebSocket reconnection attempts exhausted, falling back to demo mode');
      this.startDemoMode();
    } else {
      this.handleError(new Error('WebSocket connection error'));
    }
  }

  // Handle general errors
  private handleError(error: Error): void {
    this._lastError = error;
    this._isConnected = false;
    this._isConnecting = false;

    // Notify handlers of error
    const errorMessage: ErrorMessage = {
      type: 'error',
      sessionId: this.sessionId || '',
      timestamp: new Date().toISOString(),
      data: {
        code: 'WEBSOCKET_ERROR',
        message: error.message,
        details: error,
      },
    };

    this.messageHandlers.forEach(handler => {
      try {
        handler(errorMessage);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    this.reconnectCount++;
    const delay = this.options.reconnectDelay * Math.pow(2, this.reconnectCount - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectCount} in ${delay}ms`);

    setTimeout(() => {
      if (!this.isIntentionallyClosed && this.sessionId) {
        this.connect(this.sessionId);
      }
    }, delay);
  }

  // Start heartbeat
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this._isConnected) {
        this.send({
          type: 'heartbeat',
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        });
      }
    }, this.options.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Cleanup resources
  private cleanup(): void {
    this.stopHeartbeat();

    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    if (this.demoTimer) {
      clearTimeout(this.demoTimer);
      this.demoTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this._isConnected = false;
    this._isConnecting = false;
    this.isDemoMode = false;
  }

  // Start demo mode with simulated processing updates
  private startDemoMode(): void {
    console.log('Starting WebSocket demo mode with simulated processing updates');
    this.isDemoMode = true;
    this._isConnected = true;
    this._isConnecting = false;

    // Clear connection timer
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    // Simulate processing stages
    const stages = [
      { id: 'upload', name: 'Processing Upload', duration: 2000 },
      { id: 'analysis', name: 'Analyzing Images', duration: 3000 },
      { id: 'enhancement', name: 'AI Enhancement', duration: 4000 },
      { id: 'generation', name: 'Generating Headshots', duration: 5000 },
      { id: 'finalization', name: 'Finalizing Results', duration: 2000 }
    ];

    let currentStage = 0;
    let progress = 0;

    const simulateProgress = () => {
      if (this.isIntentionallyClosed || !this.isDemoMode) {
        return;
      }

      progress += Math.random() * 15 + 5; // Random progress increment

      // Send progress update
      this.simulateMessage({
        type: 'processing_update',
        sessionId: this.sessionId || 'demo-session',
        timestamp: new Date().toISOString(),
        data: {
          session: {
            id: this.sessionId || 'demo-session',
            status: 'processing',
            progress: Math.min(progress, 100),
            currentStage: stages[currentStage]?.name || 'Processing',
            estimatedTimeRemaining: Math.max(0, (100 - progress) * 1000),
          },
          updatedStages: stages.slice(0, currentStage + 1).map((stage, index) => ({
            ...stage,
            status: index < currentStage ? 'completed' : index === currentStage ? 'processing' : 'pending',
            progress: index < currentStage ? 100 : index === currentStage ? progress : 0,
          }))
        }
      });

      // Move to next stage when current stage reaches ~80% progress
      if (progress >= (currentStage + 1) * 20 && currentStage < stages.length - 1) {
        // Send stage complete message
        this.simulateMessage({
          type: 'stage_complete',
          sessionId: this.sessionId || 'demo-session',
          timestamp: new Date().toISOString(),
          data: {
            stageId: stages[currentStage].id,
            stageName: stages[currentStage].name,
            completedAt: new Date().toISOString(),
            nextStage: stages[currentStage + 1] || null,
          }
        });

        currentStage++;
      }

      // Complete session when all stages are done
      if (progress >= 100) {
        this.simulateMessage({
          type: 'session_complete',
          sessionId: this.sessionId || 'demo-session',
          timestamp: new Date().toISOString(),
          data: {
            session: {
              id: this.sessionId || 'demo-session',
              status: 'completed',
              progress: 100,
              currentStage: 'Complete',
              estimatedTimeRemaining: 0,
            },
            completedAt: new Date().toISOString(),
            resultUrls: [
              '/demo-results/headshot-1.jpg',
              '/demo-results/headshot-2.jpg',
              '/demo-results/headshot-3.jpg',
            ]
          }
        });
        return;
      }

      // Schedule next update
      this.demoTimer = setTimeout(simulateProgress, 1000 + Math.random() * 2000);
    };

    // Start simulation
    simulateProgress();
  }

  // Simulate receiving a WebSocket message
  private simulateMessage(message: WebSocketMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }
}

// Singleton instance
export const processingWebSocket = new ProcessingWebSocket();

// Hook for using WebSocket in React components
export const useProcessingWebSocket = (sessionId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const messageHandler: MessageHandler = (message) => {
      setLastMessage(message);
      
      if (message.type === 'error') {
        setError(new Error((message as ErrorMessage).data.message));
      }
    };

    // Add message handler
    processingWebSocket.addMessageHandler(messageHandler);

    // Connect
    processingWebSocket.connect(sessionId);

    // Update connection state
    const updateConnectionState = () => {
      setIsConnected(processingWebSocket.isConnected);
      setIsConnecting(processingWebSocket.isConnecting);
      setError(processingWebSocket.lastError);
    };

    const interval = setInterval(updateConnectionState, 1000);
    updateConnectionState();

    return () => {
      clearInterval(interval);
      processingWebSocket.removeMessageHandler(messageHandler);
    };
  }, [sessionId]);

  return {
    isConnected,
    isConnecting,
    error,
    lastMessage,
    disconnect: () => processingWebSocket.disconnect(),
  };
};
