// ============================================================================
// 4. src/lib/printing/printnode.ts - Kitchen Printer Integration
// ============================================================================

interface PrintNodeConfig {
  apiKey: string
  printerId?: number
}

interface PrintJob {
  orderId: string
  orderNumber: string
  items: Array<{
    name: string
    quantity: number
    price: number
    customizations?: Record<string, any>
    notes?: string
  }>
  customerInfo: {
    name: string
    phone: string
    address?: string
  }
  total: number
  orderType: 'DELIVERY' | 'PICKUP'
  specialInstructions?: string
}

export class PrintNodeService {
  private config: PrintNodeConfig

  constructor(config: PrintNodeConfig) {
    this.config = config
  }

  /**
   * Print order receipt to kitchen printer
   */
  async printOrder(printJob: PrintJob): Promise<{ success: boolean; error?: string }> {
    try {
      const receipt = this.formatReceipt(printJob)
      
      if (!this.config.printerId) {
        // Fallback to email if no printer configured
        await this.sendEmailFallback(printJob, receipt)
        return { success: true }
      }

      const response = await fetch('https://api.printnode.com/printjobs', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerId: this.config.printerId,
          title: `Order ${printJob.orderNumber}`,
          contentType: 'raw_base64',
          content: Buffer.from(receipt).toString('base64'),
          source: 'OrderGenie AI',
        }),
      })

      if (!response.ok) {
        throw new Error(`PrintNode API error: ${response.statusText}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Printing error:', error)
      
      // Fallback to email
      try {
        const receipt = this.formatReceipt(printJob)
        await this.sendEmailFallback(printJob, receipt)
        return { success: true }
      } catch (emailError) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Printing failed' 
        }
      }
    }
  }

  /**
   * Format order for thermal printer
   */
  private formatReceipt(printJob: PrintJob): string {
    const { orderNumber, items, customerInfo, total, orderType, specialInstructions } = printJob
    
    let receipt = ''
    receipt += '================================\n'
    receipt += '       ROYAL SPICE KITCHEN      \n'
    receipt += '================================\n'
    receipt += `Order: ${orderNumber}\n`
    receipt += `Type: ${orderType}\n`
    receipt += `Time: ${new Date().toLocaleString()}\n`
    receipt += '--------------------------------\n'
    receipt += `Customer: ${customerInfo.name}\n`
    receipt += `Phone: ${customerInfo.phone}\n`
    
    if (orderType === 'DELIVERY' && customerInfo.address) {
      receipt += `Address: ${customerInfo.address}\n`
    }
    
    receipt += '--------------------------------\n'
    receipt += 'ITEMS:\n'
    receipt += '--------------------------------\n'
    
    items.forEach(item => {
      receipt += `${item.quantity}x ${item.name}\n`
      if (item.customizations && Object.keys(item.customizations).length > 0) {
        receipt += `   Mods: ${JSON.stringify(item.customizations)}\n`
      }
      if (item.notes) {
        receipt += `   Notes: ${item.notes}\n`
      }
      receipt += `   £${(item.price * item.quantity).toFixed(2)}\n`
      receipt += '\n'
    })
    
    receipt += '--------------------------------\n'
    receipt += `TOTAL: £${total.toFixed(2)}\n`
    receipt += '================================\n'
    
    if (specialInstructions) {
      receipt += 'SPECIAL INSTRUCTIONS:\n'
      receipt += specialInstructions + '\n'
      receipt += '================================\n'
    }
    
    receipt += '\n\n\n' // Feed paper
    
    return receipt
  }

  /**
   * Email fallback when printer fails
   */
  private async sendEmailFallback(printJob: PrintJob, receipt: string): Promise<void> {
    // Import email service
    const { EmailService } = await import('@/lib/email/sender')
    
    await EmailService.sendEmail({
      to: process.env.KITCHEN_EMAIL || 'kitchen@restaurant.com',
      subject: `Kitchen Order ${printJob.orderNumber}`,
      text: receipt,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${receipt}</pre>`,
    })
  }

  /**
   * Get available printers
   */
  async getPrinters(): Promise<any[]> {
    try {
      const response = await fetch('https://api.printnode.com/printers', {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey + ':').toString('base64')}`,
        },
      })

      if (!response.ok) {
        throw new Error(`PrintNode API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching printers:', error)
      return []
    }
  }
}

// Singleton instance
export const printNodeService = new PrintNodeService({
  apiKey: process.env.PRINTNODE_API_KEY || '',
  printerId: process.env.PRINTNODE_PRINTER_ID ? parseInt(process.env.PRINTNODE_PRINTER_ID) : undefined,
})

// 