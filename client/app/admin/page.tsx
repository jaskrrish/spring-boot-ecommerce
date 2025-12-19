'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp, Loader2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { productApi, orderApi, userApi } from '@/lib/api';
import { useUser } from '@/components/providers/user-provider';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useUser();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [statusRevenueData, setStatusRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to access this page');
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }
    fetchStats();
  }, [user, isAdmin, router]);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        productApi.getAll(),
        orderApi.getAll(),
        userApi.getAll(),
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data;

      const pendingOrders = orders.filter(
        (order) => order.orderStatus === 'PENDING'
      ).length;

      // Calculate total revenue
      let totalRevenue = 0;
      const productMap = new Map(products.map(p => [p.id, p]));
      
      orders.forEach(order => {
        const product = productMap.get(order.productId);
        if (product) {
          totalRevenue += product.cost * order.quantity;
        }
      });

      // Group revenue by date (last 7 days)
      const revenueByDate: { [key: string]: number } = {};
      orders.forEach(order => {
        const product = productMap.get(order.productId);
        if (product) {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          revenueByDate[date] = (revenueByDate[date] || 0) + (product.cost * order.quantity);
        }
      });

      const revenueChartData = Object.entries(revenueByDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .slice(-7);

      // Group revenue by order status
      const revenueByStatus: { [key: string]: number } = {};
      orders.forEach(order => {
        const product = productMap.get(order.productId);
        if (product) {
          const status = order.orderStatus;
          revenueByStatus[status] = (revenueByStatus[status] || 0) + (product.cost * order.quantity);
        }
      });

      const statusChartData = Object.entries(revenueByStatus).map(([status, revenue]) => ({
        status,
        revenue,
      }));

      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data.length,
        totalUsers: usersRes.data.length,
        pendingOrders,
        totalRevenue,
      });
      setRevenueData(revenueChartData);
      setStatusRevenueData(statusChartData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
      icon: Package,
      href: '/admin/products',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Manage Orders',
      description: 'View and update order statuses',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your e-commerce platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">Active products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Daily revenue for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Order Status</CardTitle>
              <CardDescription>Revenue breakdown by order status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="status" 
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-4`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full">
                      Go to {action.title}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
