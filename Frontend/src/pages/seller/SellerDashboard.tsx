
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SellerSidebar } from '@/components/layout/SellerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Box,
  ShoppingBag,
  BarChart,
  Users,
  AlertTriangle,
  Clock,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { productAPI, forecastAPI, partnershipAPI } from '@/lib/api';

// Default empty data structures
const defaultDashboardData = {
  inventoryStats: { total: 0, lowStock: 0, outOfStock: 0 },
  orderStats: { pending: 0, processing: 0, completed: 0, total: 0 },
  revenueData: Array(6).fill(0).map((_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    revenue: 0,
    predicted: 0
  })),
  inventoryTrends: Array(6).fill(0).map((_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    stock: 0,
    sold: 0
  })),
  lowStockItems: [],
  recentOrders: [],
  revenueForecast: '$0.00'
};

const SellerDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(defaultDashboardData);
  const [error, setError] = useState<string | null>(null);

  // State for partnership requests
  const [partnershipRequests, setPartnershipRequests] = useState<any[]>([]);
  const [processingPartnershipId, setProcessingPartnershipId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardData, forecastData, partnershipsResponse] = await Promise.all([
          productAPI.getDashboardData(),
          forecastAPI.getDashboardForecast().catch(err => {
            console.error('Error fetching forecast data:', err);
            return null;
          }),
          partnershipAPI.getPartnerships('pending').catch(err => {
            console.error('Error fetching partnerships:', err);
            return { partnerships: [] };
          })
        ]);

        setDashboardData(dashboardData);
        setPartnershipRequests(partnershipsResponse.partnerships || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <DashboardLayout
      sidebar={<SellerSidebar />}
      header={<DashboardHeader title="Seller Dashboard" userType="seller" />}
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading dashboard data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Error loading dashboard data</p>
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Inventory"
              value={dashboardData.inventoryStats.total}
              icon={<Box className="h-5 w-5" />}
              description={`${dashboardData.inventoryStats.lowStock} low stock, ${dashboardData.inventoryStats.outOfStock} out of stock`}
              trend={{ value: 5.2, isPositive: true }}
            />
            <StatCard
              title="Orders"
              value={dashboardData.orderStats.total}
              icon={<ShoppingBag className="h-5 w-5" />}
              description={`${dashboardData.orderStats.pending} pending, ${dashboardData.orderStats.processing} processing`}
              trend={{ value: 8.1, isPositive: true }}
            />
            <StatCard
              title="Revenue Forecast"
              value={dashboardData.revenueForecast}
              icon={<BarChart className="h-5 w-5" />}
              description="Next 30 days prediction"
              trend={{ value: 3.4, isPositive: true }}
              action={<Button size="sm" variant="ghost" onClick={() => window.location.href = '/seller/forecasting'}>View Details</Button>}
            />
            <StatCard
              title="Active Partnerships"
              value="24"
              icon={<Users className="h-5 w-5" />}
              description={`${partnershipRequests.length} pending requests`}
              trend={{ value: 2.3, isPositive: true }}
            />
          </div>
        </>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard
            title="Revenue vs Prediction"
            subtitle="Last 6 months comparison"
            data={dashboardData.revenueData}
            type="area"
            dataKeys={['revenue', 'predicted']}
          />
          <ChartCard
            title="Inventory Trends"
            subtitle="Stock levels and sales"
            data={dashboardData.inventoryTrends}
            type="bar"
            dataKeys={['stock', 'sold']}
          />
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.lowStockItems.length > 0 ? (
                      dashboardData.lowStockItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>{item.threshold}</TableCell>
                          <TableCell>
                            <Badge variant={item.currentStock < 5 ? "destructive" : "outline"} className="flex w-fit items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {item.currentStock < 5 ? "Critical" : "Low Stock"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No low stock items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partnership Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {partnershipRequests.length > 0 ? (
                partnershipRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{request.retailer.name}</h4>
                        <p className="text-sm text-gray-500">{request.retailer.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {request.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full"
                        onClick={async () => {
                          try {
                            setProcessingPartnershipId(request.id);
                            await partnershipAPI.updatePartnershipStatus(request.id, 'active');
                            setPartnershipRequests(partnershipRequests.filter(p => p.id !== request.id));
                            toast({
                              title: 'Success',
                              description: 'Partnership request accepted',
                            });
                          } catch (error: any) {
                            console.error('Error accepting partnership:', error);
                            toast({
                              title: 'Error',
                              description: error.message || 'Failed to accept partnership',
                              variant: 'destructive',
                            });
                          } finally {
                            setProcessingPartnershipId(null);
                          }
                        }}
                        disabled={processingPartnershipId === request.id}
                      >
                        {processingPartnershipId === request.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          try {
                            setProcessingPartnershipId(request.id);
                            await partnershipAPI.updatePartnershipStatus(request.id, 'rejected');
                            setPartnershipRequests(partnershipRequests.filter(p => p.id !== request.id));
                            toast({
                              title: 'Success',
                              description: 'Partnership request declined',
                            });
                          } catch (error: any) {
                            console.error('Error declining partnership:', error);
                            toast({
                              title: 'Error',
                              description: error.message || 'Failed to decline partnership',
                              variant: 'destructive',
                            });
                          } finally {
                            setProcessingPartnershipId(null);
                          }
                        }}
                        disabled={processingPartnershipId === request.id}
                      >
                        {processingPartnershipId === request.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No pending partnership requests</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {!loading && !error && (
        <div className="mb-6">
          <DataTable
            title="Recent Orders"
            columns={[
              { key: 'id', header: 'Order ID' },
              { key: 'customer', header: 'Customer' },
              { key: 'items', header: 'Items' },
              { key: 'total', header: 'Total', className: 'text-right' },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => {
                  const statusVariant =
                    row.status === 'Completed' ? 'success' :
                    row.status === 'Processing' ? 'default' : 'secondary';
                  const statusIcon =
                    row.status === 'Completed' ? <Check className="h-3.5 w-3.5 mr-1" /> :
                    row.status === 'Processing' ? <Clock className="h-3.5 w-3.5 mr-1" /> :
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />;

                  return (
                    <Badge variant={statusVariant} className="flex w-fit items-center">
                      {statusIcon}
                      {row.status}
                    </Badge>
                  );
                }
              },
              { key: 'date', header: 'Date' },
            ]}
            data={dashboardData.recentOrders}
            actions={
              <Button size="sm" variant="outline">View All Orders</Button>
            }
            emptyMessage="No recent orders found"
          />
        </div>
      )}
    </DashboardLayout>
  );
};

const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full">
    {children}
  </table>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead>
    {children}
  </thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>
    {children}
  </tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b">
    {children}
  </tr>
);

const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-3">
    {children}
  </td>
);

export default SellerDashboard;
