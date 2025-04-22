import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { retailerAPI } from '@/lib/api';
import { Loader2, Search, Calendar, DollarSign, BarChart } from 'lucide-react';
import { ChartCard } from '@/components/dashboard/ChartCard';

const Sales = () => {
  const { toast } = useToast();
  const [sales, setSales] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalSales: 0,
    totalQuantity: 0,
    totalRevenue: 0,
    salesByCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await retailerAPI.getSales(startDate, endDate);
      setSales(response.sales);
      setSummary(response.summary);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load sales data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchSales();
  };

  const filteredSales = sales.filter(sale => 
    sale.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart data
  const prepareCategoryData = () => {
    return Object.entries(summary.salesByCategory || {}).map(([category, data]: [string, any]) => ({
      name: category,
      revenue: data.revenue,
      quantity: data.quantity
    }));
  };

  // Group sales by date for chart
  const prepareSalesByDateData = () => {
    const salesByDate: { [key: string]: { revenue: number, quantity: number } } = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString();
      if (!salesByDate[date]) {
        salesByDate[date] = { revenue: 0, quantity: 0 };
      }
      salesByDate[date].revenue += sale.totalAmount;
      salesByDate[date].quantity += sale.quantity;
    });
    
    return Object.entries(salesByDate).map(([date, data]) => ({
      name: date,
      revenue: data.revenue,
      quantity: data.quantity
    }));
  };

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Sales" userType="buyer" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sales History</h2>
          <Button onClick={() => window.location.href = '/buyer/inventory'}>
            Manage Inventory
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-2xl font-bold">
                  {summary.totalSales}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total number of sales transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Quantity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-2xl font-bold">
                  {summary.totalQuantity}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total units sold
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-2xl font-bold">
                  ${summary.totalRevenue?.toFixed(2)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total revenue from sales
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Sales by Category"
            subtitle="Revenue and quantity by product category"
            data={prepareCategoryData()}
            type="bar"
            dataKeys={['revenue', 'quantity']}
          />
          
          <ChartCard
            title="Sales Over Time"
            subtitle="Revenue and quantity by date"
            data={prepareSalesByDateData()}
            type="line"
            dataKeys={['revenue', 'quantity']}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
            <CardDescription>
              View and filter your sales history
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <div className="flex items-center space-x-2">
                <div>
                  <label className="text-sm">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button 
                  className="mt-5"
                  onClick={handleDateFilter}
                >
                  Filter
                </Button>
              </div>
              <div className="relative flex-grow mt-2 sm:mt-0 sm:ml-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sales..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading sales data...</span>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No sales found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm || startDate || endDate
                    ? 'Try different search terms or date range'
                    : 'You haven\'t recorded any sales yet'}
                </p>
                {!searchTerm && !startDate && !endDate && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.href = '/buyer/inventory'}
                  >
                    Go to Inventory
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {new Date(sale.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sale.product.name}</div>
                            <div className="text-xs text-gray-500">SKU: {sale.product.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{sale.product.category}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>${sale.product.price.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${sale.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
