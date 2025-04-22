
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  BarChart, 
  ClipboardList, 
  Users, 
  Store,
  PackageOpen,
  Clock,
  Check,
  ArrowRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Sample data for buyer dashboard
const recentOrders = [
  { id: 'ORD-1234', supplier: 'ElectroGoods Inc', items: 8, total: '$1,670.00', status: 'Pending', date: '2023-05-19' },
  { id: 'ORD-1233', supplier: 'TechSupplies', items: 12, total: '$2,340.00', status: 'Shipped', date: '2023-05-18' },
  { id: 'ORD-1232', supplier: 'GadgetWorld', items: 5, total: '$890.00', status: 'Delivered', date: '2023-05-15' },
  { id: 'ORD-1231', supplier: 'ElectroGoods Inc', items: 10, total: '$2,100.00', status: 'Delivered', date: '2023-05-12' },
];

const bestSellers = [
  { name: 'Wireless Earbuds', category: 'Audio', sold: 145, stock: 32, supplier: 'AudioTech' },
  { name: 'Smart Watch Pro', category: 'Wearables', sold: 98, stock: 15, supplier: 'TechGear' },
  { name: 'Bluetooth Speaker', category: 'Audio', sold: 87, stock: 23, supplier: 'SoundSystems' },
  { name: 'USB-C Fast Charger', category: 'Accessories', sold: 76, stock: 41, supplier: 'PowerPlus' },
];

const partnerSuppliers = [
  { id: 1, name: 'ElectroGoods Inc', products: 128, category: 'Electronics', status: 'Active' },
  { id: 2, name: 'TechSupplies', products: 94, category: 'Mixed', status: 'Active' },
  { id: 3, name: 'AudioTech', products: 45, category: 'Audio', status: 'Active' },
  { id: 4, name: 'GadgetWorld', products: 72, category: 'Gadgets', status: 'Pending' },
];

const salesTrends = [
  { name: 'Jan', sales: 12000, forecast: 11500 },
  { name: 'Feb', sales: 14000, forecast: 13800 },
  { name: 'Mar', sales: 13500, forecast: 14000 },
  { name: 'Apr', sales: 15800, forecast: 15500 },
  { name: 'May', sales: 16500, forecast: 16800 },
  { name: 'Jun', sales: 17200, forecast: 18000 },
];

const categoryPerformance = [
  { name: 'Electronics', sales: 35, target: 30 },
  { name: 'Accessories', sales: 28, target: 35 },
  { name: 'Audio', sales: 22, target: 20 },
  { name: 'Wearables', sales: 15, target: 15 },
];

const productRecommendations = [
  { name: 'Wireless Keyboard', supplier: 'TechSupplies', reason: 'High Demand', confidence: 85 },
  { name: 'Smart Home Hub', supplier: 'ConnectedHome', reason: 'Trending', confidence: 78 },
  { name: 'Gaming Headset', supplier: 'AudioTech', reason: 'Seasonal', confidence: 72 },
];

const BuyerDashboard = () => {
  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Buyer Dashboard" userType="buyer" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value="42"
          icon={<ShoppingBag className="h-5 w-5" />}
          description="This month"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Sales Revenue"
          value="$28,547"
          icon={<Store className="h-5 w-5" />}
          description="This month"
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard
          title="Inventory Items"
          value="1,254"
          icon={<PackageOpen className="h-5 w-5" />}
          description="Across all categories"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Partner Suppliers"
          value={partnerSuppliers.filter(p => p.status === 'Active').length.toString()}
          icon={<Users className="h-5 w-5" />}
          description={`${partnerSuppliers.filter(p => p.status === 'Pending').length} pending`}
          trend={{ value: 1, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Sales Performance vs Forecast"
          subtitle="Last 6 months"
          data={salesTrends}
          type="area"
          dataKeys={['sales', 'forecast']}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.map((category) => {
                const progress = (category.sales / category.target) * 100;
                const isOnTarget = category.sales >= category.target;
                
                return (
                  <div key={category.name} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">
                        {category.sales}% / {category.target}% Target
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-right">
                      <span className={isOnTarget ? 'text-green-600' : 'text-amber-600'}>
                        {isOnTarget ? 'On Target' : 'Below Target'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Recent Orders"
            columns={[
              { key: 'id', header: 'Order ID' },
              { 
                key: 'supplier', 
                header: 'Supplier',
                cell: (row) => (
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{row.supplier.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span>{row.supplier}</span>
                  </div>
                )
              },
              { key: 'items', header: 'Items' },
              { key: 'total', header: 'Total', className: 'text-right' },
              { 
                key: 'status', 
                header: 'Status',
                cell: (row) => {
                  const statusMap: {[key: string]: {variant: string, icon: React.ReactNode}} = {
                    'Pending': { variant: 'secondary', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
                    'Shipped': { variant: 'outline', icon: <ArrowRight className="h-3.5 w-3.5 mr-1" /> },
                    'Delivered': { variant: 'success', icon: <Check className="h-3.5 w-3.5 mr-1" /> },
                  };
                  
                  const { variant, icon } = statusMap[row.status] || statusMap['Pending'];
                  
                  return (
                    <Badge variant={variant} className="flex w-fit items-center">
                      {icon}
                      {row.status}
                    </Badge>
                  );
                }
              },
              { key: 'date', header: 'Date' },
            ]}
            data={recentOrders}
            actions={
              <Button size="sm" variant="outline">View All Orders</Button>
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productRecommendations.map((product, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">Supplier: {product.supplier}</div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline">{product.reason}</Badge>
                    <span className="text-xs font-medium text-gray-500">{product.confidence}% confidence</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Best Selling Products"
          columns={[
            { key: 'name', header: 'Product Name' },
            { 
              key: 'category', 
              header: 'Category',
              cell: (row) => (
                <Badge variant="outline" className="bg-gray-50">
                  {row.category}
                </Badge>
              )
            },
            { key: 'sold', header: 'Units Sold' },
            { key: 'stock', header: 'Current Stock' },
            { key: 'supplier', header: 'Supplier' },
          ]}
          data={bestSellers}
          actions={
            <Button size="sm" variant="outline">View All Products</Button>
          }
        />
        
        <DataTable
          title="Partner Suppliers"
          columns={[
            { 
              key: 'name', 
              header: 'Supplier',
              cell: (row) => (
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{row.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{row.name}</span>
                </div>
              )
            },
            { key: 'products', header: 'Products' },
            { key: 'category', header: 'Primary Category' },
            { 
              key: 'status', 
              header: 'Status',
              cell: (row) => (
                <Badge variant={row.status === 'Active' ? 'success' : 'outline'}>
                  {row.status}
                </Badge>
              )
            },
          ]}
          data={partnerSuppliers}
          actions={
            <Button size="sm" variant="outline">Manage Partners</Button>
          }
        />
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
