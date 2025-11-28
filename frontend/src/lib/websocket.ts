import ReconnectingWebSocket from 'reconnecting-websocket'

export class QueueWebSocketManager {
  private ws: ReconnectingWebSocket | null = null
  private listeners: Map<string, ((data: any) => void)[]> = new Map()
  private isConnected = false
  private url: string

  constructor(url: string) {
    this.url = url
  }

  connect(): void {
    if (this.ws) {
      // Already connected or connecting
      return
    }

    this.ws = new ReconnectingWebSocket(this.url, [], {
      maxReconnectionDelay: 30000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 4000,
      maxRetries: 10
    })

    this.ws.addEventListener('open', () => {
      console.log('WebSocket connected to queue-updates')
      this.isConnected = true

      // Join queue-updates channel
      this.ws?.send(JSON.stringify({
        type: 'join',
        channel: 'queue-updates'
      }))
    })

    this.ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    })

    this.ws.addEventListener('close', () => {
      console.log('WebSocket disconnected')
      this.isConnected = false
    })

    this.ws.addEventListener('error', (error) => {
      this.isConnected = false
      // WebSocket connection errors are expected when server doesn't support WS
      // Don't log errors for normal connection failures - just fallback to polling
      console.log('WebSocket connection failed, falling back to polling')

      // Trigger error callback if listeners are available
      if (this.listeners.has('error')) {
        this.listeners.get('error')?.forEach(callback => {
          try {
            callback(error)
          } catch (e) {
            console.error('Error in WebSocket error listener:', e)
          }
        })
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }

  private handleMessage(message: any): void {
    console.log('WebSocket message received:', message)

    // Support for Laravel Reverb format and general queue events
    const eventType = message.event || message.type
    const data = message.data || message

    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)?.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket listener for ${eventType}:`, error)
        }
      })
    }
  }

  on(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(callback)

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventType)
      if (eventListeners) {
        const index = eventListeners.indexOf(callback)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
        if (eventListeners.length === 0) {
          this.listeners.delete(eventType)
        }
      }
    }
  }

  off(eventType: string, callback?: (data: any) => void): void {
    if (!callback) {
      this.listeners.delete(eventType)
      return
    }

    const eventListeners = this.listeners.get(eventType)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
      if (eventListeners.length === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  send(data: any): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected, cannot send message:', data)
    }
  }

  get isWebSocketConnected(): boolean {
    return this.isConnected
  }
}

// Singleton instance
let queueWebSocket: QueueWebSocketManager | null = null

export const getQueueWebSocket = (): QueueWebSocketManager => {
  if (!queueWebSocket) {
    // Default to polling fallback if WebSocket URL not available
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws') + '/app/queue-updates'
    queueWebSocket = new QueueWebSocketManager(wsUrl)
  }
  return queueWebSocket
}

export const connectQueueWebSocket = (): void => {
  getQueueWebSocket().connect()
}

export const disconnectQueueWebSocket = (): void => {
  if (queueWebSocket) {
    queueWebSocket.disconnect()
    queueWebSocket = null
  }
}
