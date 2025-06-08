// src/components/AdminDashboard.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, Package, Users, TrendingUp, Settings, Menu, X, 
  ShoppingBag, DollarSign, Clock, AlertCircle, Plus, Search,
  Filter, Download, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const { state } = useRestaurant()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for demonstration
  const stats = {
    todayRevenue: 1234.56,
    todayOrders: 23,
    activeOrders: 5,
    totalCustomers: 156,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
  }

  const recentOrders = [
    { id: 'ORD001', customer: 'John Doe', total: 45.99, status: 'preparing', time: '10 mins ago' },
    { id: 'ORD002', customer: 'Jane Smith', total: 67.50, status: 'ready', time: '15 mins ago' },
    { id: 'ORD003', customer: 'Mike Johnson', total: 34.25, status: 'delivered', time: '25 mins ago' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'preparing': return 'bg-blue-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'menu', label: 'Menu Items', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed lg:relative w-64 h-full bg-white shadow-lg z-40"
      >
        <nav aria-label="Admin Sidebar" className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-royal-gold mr-2" />
              <h2 className="text-xl font-bold text-royal-burgundy">Admin Panel</h2>
            </div>
            <button
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-royal-gold/10 text-royal-gold border-l-4 border-royal-gold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
                aria-label="Refresh dashboard"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="bg-royal-gold hover:bg-royal-copper text-white"
              >
                View Restaurant
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Today's Revenue</p>
                        <p className="text-2xl font-bold text-gray-800">£{stats.todayRevenue.toFixed(2)}</p>
                        <p className="text-sm text-green-600 mt-1">+{stats.revenueGrowth}%</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-royal-gold" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Today's Orders</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.todayOrders}</p>
                        <p className="text-sm text-green-600 mt-1">+{stats.orderGrowth}%</p>
                      </div>
                      <Package className="h-8 w-8 text-royal-burgundy" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Orders</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.activeOrders}</p>
                        <p className="text-sm text-orange-600 mt-1">Needs attention</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
                        <p className="text-sm text-blue-600 mt-1">Active users</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                          <div>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">£{order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{order.time}</p>
                        </div>
                        <Badge className="capitalize">{order.status}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Orders
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Orders Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    icon={<Search className="h-4 w-4" />}
                  />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-royal-gold hover:bg-royal-copper text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export Orders
                </Button>
              </div>
              {/* Orders Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {state.orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.customerInfo.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {order.items.length} items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              £{Number(order.total).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`capitalize ${getStatusColor(order.status)} text-white`}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/orders/${order.id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-6">
              {/* Menu Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Menu Management</h2>
                <Button className="bg-royal-gold hover:bg-royal-copper text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </div>
              {/* Menu Items Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.menuItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <img
                      src={item.image || 'https://via.placeholder.com/300x200'}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <Badge variant={item.isAvailable ? "success" : "secondary"}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                      <p className="text-lg font-bold text-royal-gold">£{Number(item.price).toFixed(2)}</p>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toast.info('Edit feature coming soon!')}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toast.info('Toggle availability coming soon!')}
                        >
                          Toggle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Customer management features coming soon...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Settings management features coming soon...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
