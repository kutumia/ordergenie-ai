import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  static async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      }

      await this.transporter.sendMail(mailOptions)
      return { success: true }
    } catch (error) {
      console.error('Email sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed',
      }
    }
  }

  static async sendOrderConfirmation(order: any): Promise<void> {
    const html = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total:</strong> £${order.total.toFixed(2)}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <h3>Items:</h3>
      <ul>
        ${order.items.map((item: any) => `
          <li>${item.quantity}x ${item.menuItem.name} - £${item.totalPrice.toFixed(2)}</li>
        `).join('')}
      </ul>
      <p>We'll notify you when your order is ready!</p>
    `
    await this.sendEmail({
      to: order.customerInfo.email || order.customer?.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
    })
  }

  static async sendOrderStatusUpdate(order: any): Promise<void> {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'Your order has been confirmed and is being prepared.',
      PREPARING: 'Your order is being prepared by our kitchen.',
      READY: 'Your order is ready for pickup/delivery!',
      OUT_FOR_DELIVERY: 'Your order is on the way!',
      DELIVERED: 'Your order has been delivered. Enjoy your meal!',
    }

    const message = statusMessages[order.status] ||
      `Your order status has been updated to: ${order.status}`

    await this.sendEmail({
      to: order.customerInfo.email || order.customer?.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <h2>Order Status Update</h2>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p>${message}</p>
        <p>Thank you for choosing Royal Spice!</p>
      `,
    })
  }
}
