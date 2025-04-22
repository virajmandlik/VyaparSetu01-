import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SellerSidebar } from '@/components/layout/SellerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { productRequestAPI, productAPI } from '@/lib/api';
import { Loader2, ShoppingBag, CheckCircle, Clock, XCircle, Package, TruckIcon, AlertTriangle, Plus, Minus } from 'lucide-react';

const ProductRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [adjustedProducts, setAdjustedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests(activeTab !== 'all' ? activeTab : undefined);
    fetchSellerProducts();
  }, [activeTab]);

  const fetchSellerProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      setSellerProducts(response.products || []);
    } catch (error: any) {
      console.error('Error fetching seller products:', error);
    }
  };

  const fetchRequests = async (status?: string) => {
    try {
      setLoading(true);
      const response = await productRequestAPI.getProductRequests(status);
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

  const openApprovalDialog = (request: any) => {
    // Find stock information for each product in the request
    const productsWithStock = request.products.map((product: any) => {
      const stockInfo = sellerProducts.find(p => p.sku === product.sku) || { stock: 0 };
      return {
        ...product,
        availableStock: stockInfo.stock,
        adjustedQuantity: Math.min(product.quantity, stockInfo.stock),
        insufficientStock: stockInfo.stock < product.quantity
      };
    });

    setCurrentRequest(request);
    setAdjustedProducts(productsWithStock);
    setShowApprovalDialog(true);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 0) return;

    const updatedProducts = [...adjustedProducts];
    const maxStock = updatedProducts[index].availableStock;

    if (newQuantity > maxStock) {
      toast({
        title: 'Maximum stock reached',
        description: `Only ${maxStock} units available for ${updatedProducts[index].name}`,
        variant: 'warning',
      });
      updatedProducts[index].adjustedQuantity = maxStock;
    } else {
      updatedProducts[index].adjustedQuantity = newQuantity;
    }

    setAdjustedProducts(updatedProducts);
  };

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(requestId);

      if (status === 'approved' && showApprovalDialog) {
        // Close dialog first
        setShowApprovalDialog(false);

        // Create product updates with adjusted quantities
        const productUpdates = adjustedProducts.map(product => ({
          productId: product._id,
          status: product.adjustedQuantity > 0 ? 'approved' : 'rejected',
          adjustedQuantity: product.adjustedQuantity
        }));

        await productRequestAPI.updateProductRequestStatus(requestId, status, productUpdates);
      } else {
        await productRequestAPI.updateProductRequestStatus(requestId, status);
      }

      // Update local state
      setRequests(requests.map(req =>
        req.id === requestId
          ? { ...req, status }
          : req
      ));

      toast({
        title: 'Success',
        description: `Request ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      // Refresh the list if we're on the pending tab
      if (activeTab === 'pending') {
        fetchRequests('pending');
      }
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update request status',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleFulfillRequest = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await productRequestAPI.fulfillProductRequest(requestId);

      // Update local state
      setRequests(requests.map(req =>
        req.id === requestId
          ? { ...req, status: 'fulfilled' }
          : req
      ));

      toast({
        title: 'Success',
        description: 'Request fulfilled successfully',
      });

      // Refresh the list if we're on the approved tab
      if (activeTab === 'approved') {
        fetchRequests('approved');
      }
    } catch (error: any) {
      console.error('Error fulfilling request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fulfill request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
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
                  ? 'You haven\'t received any product requests yet'
                  : `You don't have any ${activeTab} product requests`}
              </p>
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
                <CardTitle>Request from {request.partnership.retailer.name}</CardTitle>
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

                          {/* Show stock warning if request is pending */}
                          {request.status === 'pending' && (
                            <StockAvailability sku={product.sku} quantity={product.quantity} sellerProducts={sellerProducts} />
                          )}
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

                <div className="flex justify-end gap-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openApprovalDialog(request)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Review & Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Reject
                      </Button>
                    </>
                  )}

                  {request.status === 'approved' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleFulfillRequest(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <TruckIcon className="h-4 w-4 mr-1" />
                      )}
                      Fulfill Order
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/seller/messages/${request.partnership.id}`}
                  >
                    Message Retailer
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
    <>
      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Product Request</DialogTitle>
            <DialogDescription>
              Review and adjust quantities based on your available stock
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
            {adjustedProducts.map((product, index) => (
              <Card key={index} className={product.insufficientStock ? 'border-amber-300' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    {product.insufficientStock && (
                      <Badge variant="warning" className="flex items-center gap-1 bg-amber-100 text-amber-800">
                        <AlertTriangle className="h-3 w-3" />
                        Insufficient Stock
                      </Badge>
                    )}
                  </div>
                  <CardDescription>SKU: {product.sku}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">Requested: <span className="font-medium">{product.quantity}</span></p>
                      <p className="text-sm">Available: <span className="font-medium">{product.availableStock}</span></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleQuantityChange(index, product.adjustedQuantity - 1)}
                        disabled={product.adjustedQuantity <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        max={product.availableStock}
                        value={product.adjustedQuantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        className="h-8 w-16 text-center"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleQuantityChange(index, product.adjustedQuantity + 1)}
                        disabled={product.adjustedQuantity >= product.availableStock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
            <Button
              onClick={() => handleUpdateStatus(currentRequest.id, 'approved')}
              disabled={processingId === currentRequest?.id}
            >
              {processingId === currentRequest?.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Approve with Adjusted Quantities
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <DashboardLayout
      sidebar={<SellerSidebar />}
      header={<DashboardHeader title="Product Requests" userType="seller" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Product Requests</h2>
        </div>

        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading product requests...</span>
            </div>
          ) : (
            <>
              <TabsContent value="pending">
                {renderRequestsList(requests.filter(r => r.status === 'pending'))}
              </TabsContent>

              <TabsContent value="approved">
                {renderRequestsList(requests.filter(r => r.status === 'approved'))}
              </TabsContent>

              <TabsContent value="fulfilled">
                {renderRequestsList(requests.filter(r => r.status === 'fulfilled'))}
              </TabsContent>

              <TabsContent value="rejected">
                {renderRequestsList(requests.filter(r => r.status === 'rejected'))}
              </TabsContent>

              <TabsContent value="all">
                {renderRequestsList(requests)}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
    </>
  );
};

// Helper component to show stock availability
const StockAvailability = ({ sku, quantity, sellerProducts }: { sku: string, quantity: number, sellerProducts: any[] }) => {
  const product = sellerProducts.find(p => p.sku === sku);

  if (!product) return null;

  if (product.stock === 0) {
    return (
      <Badge variant="destructive" className="ml-2 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Out of Stock
      </Badge>
    );
  }

  if (product.stock < quantity) {
    return (
      <Badge variant="warning" className="ml-2 flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
        <AlertTriangle className="h-3 w-3" />
        Only {product.stock} available
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="ml-2 flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
      <CheckCircle className="h-3 w-3" />
      In Stock
    </Badge>
  );
};

export default ProductRequests;
