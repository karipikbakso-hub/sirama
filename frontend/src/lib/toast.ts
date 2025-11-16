// Simple toast notification replacement for react-hot-toast
// This is a basic implementation that can be enhanced later

interface ToastOptions {
  duration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
}

class SimpleToast {
  private container: HTMLElement | null = null

  private createContainer() {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'toast-container'
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `
      document.body.appendChild(this.container)
    }
    return this.container
  }

  success(message: string, options?: ToastOptions) {
    this.show(message, 'success', options)
  }

  error(message: string, options?: ToastOptions) {
    this.show(message, 'error', options)
  }

  info(message: string, options?: ToastOptions) {
    this.show(message, 'info', options)
  }

  warning(message: string, options?: ToastOptions) {
    this.show(message, 'warning', options)
  }

  private show(message: string, type: 'success' | 'error' | 'info' | 'warning', options?: ToastOptions) {
    const container = this.createContainer()

    const toast = document.createElement('div')
    toast.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
      pointer-events: auto;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateX(100%);
    `

    toast.textContent = message
    container.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateX(0)'
    }, 10)

    // Auto remove
    const duration = options?.duration || 4000
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, duration)

    // Click to dismiss
    toast.addEventListener('click', () => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    })
  }

  private getBackgroundColor(type: 'success' | 'error' | 'info' | 'warning'): string {
    switch (type) {
      case 'success':
        return '#10b981' // green-500
      case 'error':
        return '#ef4444' // red-500
      case 'warning':
        return '#f59e0b' // amber-500
      case 'info':
        return '#3b82f6' // blue-500
      default:
        return '#6b7280' // gray-500
    }
  }
}

// Export singleton instance
const toast = new SimpleToast()

export default toast
export { toast }