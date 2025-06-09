// src/components/domain/orders/OrderManagement.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Clock, CheckCircle, Truck, X, Phone, MapPin,
  MessageSquare, Printer, Eye, ChefHat, DollarSign, Timer,
  AlertCircle, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Order, OrderStatus } from '@/types/restaurant'

/**
 * OrderManagement
 * Admin interface for managing, filtering, and updating restaurant orders.
 *
 * @param orders - Orders array
 * @param onUpdateStatus - async handler for updating an order's status
 * @param onRefresh - handler to refresh the order list
 */
interface OrderManagementProps {
  orders: Order[]
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
  onRefresh: () => void
}

const statusToLabel: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

export default function OrderManagement({ orders, onUpdateStatus, onRefresh }: OrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'status'>('time')

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(onRefresh, 30000)
    return () => clearInterval(interval)
  }, [onRefresh])

  // Memoized filtering & sorting
  const filteredOrders = useMemo(() => {
    const filtered = filterStatus === 'all'
      ? orders
      : orders.filter(order => order.status === filterStatus)
    return filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return getStatusPriority(b.status) - getStatusPriority(a.status)
      }
    })
  }, [orders, filterStatus, sortBy])

  function getStatusPriority(status: OrderStatus) {
    const priorities: Record<OrderStatus, number> = {
      PENDING: 5, CONFIRMED: 4, PREPARING: 3, READY: 2,
      OUT_FOR_DELIVERY: 1, DELIVERED: 0, COMPLETED: 0, CANCELLED: -1, REFUNDED: -1,
    }
    return priorities[status] ?? 0
  }

  function getStatusColor(status: OrderStatus) {
    const colors: Record<OrderStatus, string> = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-blue-500',
      PREPARING: 'bg-orange-500',
      READY: 'bg-green-500',
      OUT_FOR_DELIVERY: 'bg-purple-500',
      DELIVERED: 'bg-gray-500',
      COMPLETED: 'bg-gray-600',
      CANCELLED: 'bg-red-500',
      REFUNDED: 'bg-red-600',
    }
    return colors[status] ?? 'bg-gray-400'
  }

  function getStatusIcon(status: OrderStatus) {
    const icons: Record<OrderStatus, JSX.Element> = {
      PENDING: <Clock className="h-4 w-4" />,
      CONFIRMED: <CheckCircle className="h-4 w-4" />,
      PREPARING: <ChefHat className="h-4 w-4" />,
      READY: <Package className="h-4 w-4" />,
      OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
      DELIVERED: <CheckCircle className="h-4 w-4" />,
      COMPLETED: <CheckCircle className="h-4 w-4" />,
      CANCELLED: <X className="h-4 w-4" />,
      REFUNDED: <DollarSign className="h-4 w-4" />,
    }
    return icons[status] ?? <Package className="h-4 w-4" />
  }

  function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const workflow: Partial<Record<OrderStatus, OrderStatus>> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'DELIVERED',
      DELIVERED: 'COMPLETED'
    }
    return workflow[currentStatus] || null
  }

  async function handleStatusUpdate(orderId: string, newStatus: OrderStatus) {
    setIsUpdating(true)
    try {
      await onUpdateStatus(orderId, newStatus)
      toast.success(`Order status updated to ${statusToLabel[newStatus]}`)
      setIsDetailsOpen(false)
      onRefresh()
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  function handlePrintOrder(order: Order) {
    // In production, replace with a custom print view or print receipt only
    window.print()
    toast.success('Order sent to printer')
  }

  function getTimeElapsed(createdAt: Date | string) {
    const now = new Date()
    const created = new Date(createdAt)
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <Select value={filterStatus} onValueChange={value => setFilterStatus(value as OrderStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {Object.entries(statusToLabel).map(([status, label]) => (
                <SelectItem value={status} key={status}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={value => setSortBy(value as 'time' | 'status')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="px-3 py-1">
            {filteredOrders.length} orders
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh Orders"
            className="hover:rotate-180 transition-transform duration-500"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredOrders.map((order, index) => {
            const nextStatus = getNextStatus(order.status)
            const isPriority = order.status === 'PENDING' || order.status === 'READY'
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-lg transition-all duration-300 ${isPriority ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          #{order.orderNumber}
                          {isPriority && (
                            <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.customerInfo.name}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {statusToLabel[order.status]}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Order Type & Time */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {order.type === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {getTimeElapsed(order.createdAt)}
                      </span>
                    </div>
                    {/* Items Summary */}
                    <div className="bg-gray-50 rounded-md p-3 text-sm">
                      <p className="font-medium mb-1">
                        {order.items.length} items • £{Number(order.total).toFixed(2)}
                      </p>
                      <p className="text-gray-600 line-clamp-2">
                        {order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="View Order Details"
                        onClick={() => {
                          setSelectedOrder(order)
                          setIsDetailsOpen(true)
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {nextStatus && !['DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, nextStatus)}
                          className="flex-1 bg-royal-gold hover:bg-royal-copper text-white"
                        >
                          {nextStatus === 'OUT_FOR_DELIVERY' ? 'Dispatch' :
                            nextStatus === 'READY' ? 'Ready' :
                              statusToLabel[nextStatus]}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center justify-between">
                  <span>Order #{selectedOrder.orderNumber}</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                    {statusToLabel[selectedOrder.status]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 p-1">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Customer Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedOrder.customerInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedOrder.customerInfo.phone}</span>
                        </div>
                        {selectedOrder.type === 'DELIVERY' && selectedOrder.deliveryAddress && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span>{selectedOrder.deliveryAddress.street}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Order Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedOrder.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Placed:</span>
                          <span className="font-medium">
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {selectedOrder.estimatedTime && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Est. Time:</span>
                            <span className="font-medium">
                              {new Date(selectedOrder.estimatedTime).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  {/* Order Items */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start pb-3 border-b last:border-0">
                            <div className="flex-1">
                              <p className="font-medium">
                                {item.quantity}x {item.menuItem.name}
                              </p>
                              {item.notes && (
                                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                              )}
                            </div>
                            <span className="font-medium">
                              £{Number(item.totalPrice).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      {/* Pricing Summary */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>£{Number(selectedOrder.subtotal).toFixed(2)}</span>
                        </div>
                        {Number(selectedOrder.deliveryFee) > 0 && (
                          <div className="flex justify-between">
                            <span>Delivery Fee:</span>
                            <span>£{Number(selectedOrder.deliveryFee).toFixed(2)}</span>
                          </div>
                        )}
                        {Number(selectedOrder.discountAmount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-£{Number(selectedOrder.discountAmount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span>£{Number(selectedOrder.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Special Instructions */}
                  {selectedOrder.notes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Special Instructions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                  {/* Status Update */}
                  {!['DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(selectedOrder.status) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Update Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select
                          value={selectedOrder.status}
                          onValueChange={value => handleStatusUpdate(selectedOrder.id, value as OrderStatus)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusToLabel).map(([status, label]) => (
                              <SelectItem value={status} key={status}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handlePrintOrder(selectedOrder)}
                  aria-label="Print Order"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Order
                </Button>
                <Button onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
