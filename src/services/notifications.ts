import { Order, OrderStatus } from '../types';

export interface NotificationLog {
  id: string;
  orderId: string;
  orderNumber: string;
  recipientPhone: string;
  channel: 'whatsapp' | 'sms';
  type: 'order_confirmed' | 'packing' | 'out_for_delivery' | 'delivered';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export const NotificationService = {
  // Play crystal-clear gentle order alert chime using Web Audio API (no external mp3 file needed)
  playOrderChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Two-tone cheerful announcement chime: note 1 (E5 = 659.25Hz), note 2 (G#5 = 830.61Hz), note 3 (B5 = 987.77Hz)
      const playTone = (freq: number, startTime: number, duration: number, gainVal: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playTone(587.33, 0, 0.22, 0.18); // D5
      playTone(739.99, 0.14, 0.25, 0.22); // F#5
      playTone(880.0, 0.28, 0.45, 0.25); // A5
    } catch (e) {
      console.warn('Audio chime playback ignored:', e);
    }
  },

  // Try browser push / tab notification for admin
  requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return Promise.resolve(false);
    if (Notification.permission === 'granted') return Promise.resolve(true);
    if (Notification.permission !== 'denied') {
      return Notification.requestPermission().then((permission) => permission === 'granted');
    }
    return Promise.resolve(false);
  },

  showDesktopNotification(title: string, body: string): void {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      }
    } catch {
      // ignore
    }
  },
  // Generate templated WhatsApp message content
  buildWhatsAppMessage(order: Order, stage?: OrderStatus): string {
    const status = stage || order.status;
    let statusText = '✅ Order Confirmed';
    if (status === 'packing') statusText = '📦 Packing at Farm Cold Hub';
    if (status === 'on_the_way') statusText = '🚚 Out for Delivery with Live GPS';
    if (status === 'delivered') statusText = '🏡 Successfully Delivered to Doorstep';

    const itemsSummary = order.items
      .map((i) => `• ${i.quantity}x ${i.product.name} (${i.selectedWeight})`)
      .join('\n');

    return `🌿 *NASBALADNA FARM FRESH DELIVERIES*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `${statusText}\n` +
      `*Order #:* ${order.orderNumber}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Address:* ${order.address}, ${order.district}\n` +
      `*Delivery Window:* ${order.deliverySlot}\n` +
      `*Payment:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'paid' ? 'PAID' : 'DUE ON ARRIVAL'})\n` +
      `*Total Amount:* ${order.currency} ${order.total.toFixed(2)}\n\n` +
      `*Harvest Items:*\n${itemsSummary}\n\n` +
      `*Assigned Courier:* ${order.courier.name} (${order.courier.phone})\n` +
      `*Vehicle Plate:* ${order.courier.plateNumber} (${order.courier.vehicle})\n\n` +
      `📍 Track live delivery route on map or reach us anytime at +974 7731 5415.`;
  },

  // Generate templated SMS message content (compact standard GSM SMS format)
  buildSmsMessage(order: Order, stage?: OrderStatus): string {
    const status = stage || order.status;
    let statusMsg = 'confirmed & being prepared';
    if (status === 'packing') statusMsg = 'packed in cold box';
    if (status === 'on_the_way') statusMsg = `dispatched with courier ${order.courier.name} (${order.courier.phone})`;
    if (status === 'delivered') statusMsg = 'delivered to your doorstep. Enjoy fresh produce!';

    return `NasBaladna Fresh: Order #${order.orderNumber} is ${statusMsg}. Total: ${order.currency} ${order.total.toFixed(2)}. Address: ${order.address}. Hotline: +974 77315415.`;
  },

  // Generate direct click-to-chat WhatsApp link
  getWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  },

  // Generate direct click-to-sms link for mobile browsers
  getSmsUrl(phone: string, text: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
  },

  // Automated dispatch simulation logger (stores into localStorage & backend for audit trail)
  sendAutomatedNotification(
    order: Order,
    channel: 'whatsapp' | 'sms',
    stage?: OrderStatus
  ): NotificationLog {
    const message =
      channel === 'whatsapp'
        ? this.buildWhatsAppMessage(order, stage)
        : this.buildSmsMessage(order, stage);

    const log: NotificationLog = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipientPhone: order.phone,
      channel,
      type:
        (stage || order.status) === 'confirmed'
          ? 'order_confirmed'
          : (stage || order.status) === 'packing'
          ? 'packing'
          : (stage || order.status) === 'on_the_way'
          ? 'out_for_delivery'
          : 'delivered',
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'delivered',
    };

    // Save to localStorage history
    try {
      const existingStr = localStorage.getItem('nb_notification_logs') || '[]';
      const existing: NotificationLog[] = JSON.parse(existingStr);
      existing.unshift(log);
      localStorage.setItem('nb_notification_logs', JSON.stringify(existing.slice(0, 100)));
    } catch {
      // ignore storage quota error
    }

    return log;
  },

  // Get all notification history logs
  getLogs(): NotificationLog[] {
    try {
      const existingStr = localStorage.getItem('nb_notification_logs') || '[]';
      return JSON.parse(existingStr);
    } catch {
      return [];
    }
  },
};
