import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { productRequestAPI } from '@/lib/api';
import { Loader2, ShoppingBag, CheckCircle, Clock, XCircle, Package } from 'lucide-react';

const ProductRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await productRequestAPI.getProductRequests();
      setRequests(response.requests);
    } catch (error: any) {
      console.error('Error fetching product requests:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load product requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'fulfilled':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            Fulfilled
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredRequests = () => {
    if (activeTab === 'all') {
      return requests;
    }
    return requests.filter(request => request.status === activeTab);
  };

  const renderRequestsList = (requestsList: any[]) => {
    if (requestsList.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No product requests found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'all' 
                  ? 'You haven\'t made any product requests yet' 
                  : `You don't have any ${activeTab} product requests`}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = '/buyer/partnerships'}
              >
                View Partnerships
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {requestsList.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>Request to {request.partnership.seller.name}</CardTitle>
                {getStatusBadge(request.status)}
              </div>
              <CardDescription>
                Created on {new Date(request.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Requested Products</h4>
                  <div className="space-y-2">
                    {request.products.map((product: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 border rounded-md"
                      >
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            SKU: {product.sku}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">Qty: {product.quantity}</span>
                          {getStatusBadge(product.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {request.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                      {request.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/buyer/product-requests/${request.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Product Requests" userType="buyer" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Product Requests</h2>
          <Button onClick={() => window.location.href = '/buyer/partnerships'}>
            View Partnerships
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading product requests...</span>
            </div>
          ) : (
            renderRequestsList(filteredRequests())
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProductRequests;
