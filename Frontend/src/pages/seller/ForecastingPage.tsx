import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SellerSidebar } from '@/components/layout/SellerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Package, 
  ShoppingBag,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { forecastAPI } from '@/lib/api';

// Default empty data structures
const defaultForecastData = {
  success: false,
  salesForecast: {
    total: 0,
    byCategory: {},
    daily: []
  },
  revenueForecast: {
    total: 0,
    byCategory: {},
    daily: []
  }
};

const ForecastingPage = () => {
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState(defaultForecastData);
  const [forecastPeriod, setForecastPeriod] = useState('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      const data = await forecastAPI.getDashboardForecast();
      setForecastData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching forecast data:', err);
      setError(err.message || 'Failed to load forecast data');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = async (value: string) => {
    setForecastPeriod(value);
    try {
      setLoading(true);
      const days = parseInt(value);
      const [salesData, revenueData] = await Promise.all([
        forecastAPI.getSalesForecast(days),
        forecastAPI.getRevenueForecast(days)
      ]);
      
      if (salesData.success && revenueData.success) {
        setForecastData({
          success: true,
          salesForecast: {
            total: salesData.totalForecast,
            byCategory: salesData.categoryForecasts,
            daily: salesData.forecast.map((day: any) => ({
              date: day.date,
              quantity: day.quantity
            }))
          },
          revenueForecast: {
            total: revenueData.totalRevenue,
            byCategory: revenueData.categoryRevenueForecasts,
            daily: revenueData.forecast.map((day: any) => ({
              date: day.date,
              revenue: day.revenue
            }))
          }
        });
        setError(null);
      } else {
        setError(salesData.message || revenueData.message || 'Failed to load forecast data');
      }
    } catch (err: any) {
      console.error('Error fetching forecast data:', err);
      setError(err.message || 'Failed to load forecast data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareSalesChartData = () => {
    if (!forecastData.success || !forecastData.salesForecast.daily.length) {
      return Array(30).fill(0).map((_, i) => ({
        name: `Day ${i+1}`,
        sales: 0
      }));
    }

    return forecastData.salesForecast.daily.map((day: any) => ({
      name: day.date.substring(5), // Format: MM-DD
      sales: day.quantity
    }));
  };

  const prepareRevenueChartData = () => {
    if (!forecastData.success || !forecastData.revenueForecast.daily.length) {
      return Array(30).fill(0).map((_, i) => ({
        name: `Day ${i+1}`,
        revenue: 0
      }));
    }

    return forecastData.revenueForecast.daily.map((day: any) => ({
      name: day.date.substring(5), // Format: MM-DD
      revenue: day.revenue
    }));
  };

  // Prepare category data for tables
  const prepareCategoryData = () => {
    if (!forecastData.success) return [];

    const categories = Object.keys(forecastData.salesForecast.byCategory);
    
    return categories.map(category => ({
      category,
      salesForecast: forecastData.salesForecast.byCategory[category] || 0,
      revenueForecast: forecastData.revenueForecast.byCategory[category] || 0
    }));
  };

  return (
    <DashboardLayout
      sidebar={<SellerSidebar />}
      header={<DashboardHeader title="Sales & Revenue Forecasting" userType="seller" />}
    >
      <div className="space-y-6">
        {/* Forecast Period Selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Demand Forecasting</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Forecast Period:</span>
            <Select value={forecastPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Next 7 Days</SelectItem>
                <SelectItem value="30">Next 30 Days</SelectItem>
                <SelectItem value="90">Next 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading forecast data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Error loading forecast data</p>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => fetchForecastData()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Forecast Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Forecasted Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-2xl font-bold">
                      {forecastData.salesForecast.total} units
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Predicted for the next {forecastPeriod} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Forecasted Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-2xl font-bold">
                      ${forecastData.revenueForecast.total.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Predicted for the next {forecastPeriod} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Daily Average Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-2xl font-bold">
                      {Math.round(forecastData.salesForecast.total / parseInt(forecastPeriod))} units/day
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Average daily sales prediction
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Daily Average Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-2xl font-bold">
                      ${Math.round(forecastData.revenueForecast.total / parseInt(forecastPeriod)).toLocaleString()}/day
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Average daily revenue prediction
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Forecast Charts */}
            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="sales">Sales Forecast</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sales" className="space-y-4">
                <ChartCard
                  title="Sales Forecast"
                  subtitle={`Next ${forecastPeriod} days prediction`}
                  data={prepareSalesChartData()}
                  type="bar"
                  dataKeys={['sales']}
                />
                
                <DataTable
                  title="Sales Forecast by Category"
                  columns={[
                    { key: 'category', header: 'Category' },
                    { 
                      key: 'salesForecast', 
                      header: 'Forecasted Sales',
                      cell: (row) => (
                        <div className="font-medium">{row.salesForecast} units</div>
                      )
                    },
                    { 
                      key: 'percentage', 
                      header: 'Percentage',
                      cell: (row) => {
                        const percentage = Math.round((row.salesForecast / forecastData.salesForecast.total) * 100);
                        return (
                          <Badge variant="outline" className="bg-gray-50">
                            {percentage}%
                          </Badge>
                        );
                      }
                    }
                  ]}
                  data={prepareCategoryData()}
                  emptyMessage="No category data available"
                />
              </TabsContent>
              
              <TabsContent value="revenue" className="space-y-4">
                <ChartCard
                  title="Revenue Forecast"
                  subtitle={`Next ${forecastPeriod} days prediction`}
                  data={prepareRevenueChartData()}
                  type="area"
                  dataKeys={['revenue']}
                />
                
                <DataTable
                  title="Revenue Forecast by Category"
                  columns={[
                    { key: 'category', header: 'Category' },
                    { 
                      key: 'revenueForecast', 
                      header: 'Forecasted Revenue',
                      cell: (row) => (
                        <div className="font-medium">${row.revenueForecast.toLocaleString()}</div>
                      )
                    },
                    { 
                      key: 'percentage', 
                      header: 'Percentage',
                      cell: (row) => {
                        const percentage = Math.round((row.revenueForecast / forecastData.revenueForecast.total) * 100);
                        return (
                          <Badge variant="outline" className="bg-gray-50">
                            {percentage}%
                          </Badge>
                        );
                      }
                    }
                  ]}
                  data={prepareCategoryData()}
                  emptyMessage="No category data available"
                />
              </TabsContent>
            </Tabs>

            {/* Forecast Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Forecast Insights</CardTitle>
                <CardDescription>
                  Key insights based on your historical sales data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Sales Trend</h4>
                      <p className="text-sm text-gray-500">
                        Your sales are projected to {forecastData.salesForecast.total > 100 ? 'grow' : 'remain stable'} over the next {forecastPeriod} days.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Package className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Top Performing Category</h4>
                      <p className="text-sm text-gray-500">
                        {prepareCategoryData().length > 0 ? (
                          <>
                            <span className="font-medium">{prepareCategoryData().sort((a, b) => b.salesForecast - a.salesForecast)[0]?.category}</span> is 
                            expected to be your best-selling category.
                          </>
                        ) : (
                          'Not enough data to determine top category.'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Inventory Planning</h4>
                      <p className="text-sm text-gray-500">
                        Based on the forecast, ensure you have at least {Math.ceil(forecastData.salesForecast.total * 1.2)} units in stock to meet demand with a 20% safety margin.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ForecastingPage;
