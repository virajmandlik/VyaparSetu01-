import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { partnershipAPI, productAPI, productRequestAPI } from '@/lib/api';
import { Loader2, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

const RequestProducts = () => {
  const { partnershipId } = useParams<{ partnershipId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [partnership, setPartnership] = useState<any>(null);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [requestedProducts, setRequestedProducts] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (partnershipId) {
      fetchPartnershipDetails();
    }
  }, [partnershipId]);

  const fetchPartnershipDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching partnership details for ID:', partnershipId);
      const partnershipResponse = await partnershipAPI.getPartnershipDetails(partnershipId!);
      console.log('Partnership details:', partnershipResponse);
      setPartnership(partnershipResponse.partnership);

      // Fetch seller's products using the seller ID from the partnership
      const sellerId = partnershipResponse.partnership.seller.id;
      console.log('Fetching products for seller ID:', sellerId);
      const productsResponse = await productAPI.getProducts(sellerId);
      console.log('Products response:', productsResponse);
      setSellerProducts(productsResponse.products || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load partnership details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: any) => {
    // Check if product is already in the list
    const existingIndex = requestedProducts.findIndex(p => p.sku === product.sku);

    if (existingIndex >= 0) {
      // Update quantity if already in list
      const updatedProducts = [...requestedProducts];
      // Make sure we don't exceed available stock
      if (updatedProducts[existingIndex].quantity < product.stock) {
        updatedProducts[existingIndex].quantity += 1;
        setRequestedProducts(updatedProducts);
      } else {
        toast({
          title: 'Maximum stock reached',
          description: `Only ${product.stock} units available for ${product.name}`,
          variant: 'warning',
        });
      }
    } else {
      // Add new product to list
      setRequestedProducts([
        ...requestedProducts,
        {
          sku: product.sku,
          name: product.name,
          quantity: 1,
          maxStock: product.stock,
          price: product.price
        }
      ]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...requestedProducts];
    updatedProducts.splice(index, 1);
    setRequestedProducts(updatedProducts);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedProducts = [...requestedProducts];
    const maxStock = updatedProducts[index].maxStock;

    if (newQuantity > maxStock) {
      toast({
        title: 'Maximum stock reached',
        description: `Only ${maxStock} units available for ${updatedProducts[index].name}`,
        variant: 'warning',
      });
      updatedProducts[index].quantity = maxStock;
    } else {
      updatedProducts[index].quantity = newQuantity;
    }

    setRequestedProducts(updatedProducts);
  };

  const handleSubmit = async () => {
    if (requestedProducts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product to your request',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await productRequestAPI.createProductRequest(
        partnershipId!,
        requestedProducts,
        notes
      );

      toast({
        title: 'Success',
        description: 'Product request submitted successfully',
      });

      // Redirect to product requests page
      window.location.href = '/buyer/product-requests';
    } catch (error: any) {
      console.error('Error submitting product request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit product request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebar={<BuyerSidebar />}
        header={<DashboardHeader title="Request Products" userType="buyer" />}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!partnership) {
    return (
      <DashboardLayout
        sidebar={<BuyerSidebar />}
        header={<DashboardHeader title="Request Products" userType="buyer" />}
      >
        <Card>
          <CardContent className="py-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Partnership not found</h3>
              <p className="text-sm text-gray-500 mt-1">
                The partnership you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.href = '/buyer/partnerships'}
              >
                Back to Partnerships
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Request Products" userType="buyer" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Request Products</h2>
            <p className="text-gray-500">
              Requesting products from {partnership.seller.name}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/buyer/partnerships'}
          >
            Back to Partnerships
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>
                  Select products to add to your request
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium">Loading products...</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Please wait while we fetch the seller's products.
                    </p>
                  </div>
                ) : sellerProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No products available</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      This seller doesn't have any products available yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellerProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="text-sm text-gray-500">
                            <span className="mr-3">SKU: {product.sku}</span>
                            <span className="mr-3">Category: {product.category}</span>
                            <span className="mr-3">Price: ${product.price.toFixed(2)}</span>
                            <span className="font-medium text-blue-600">Available: {product.stock} units</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddProduct(product)}
                          disabled={product.stock <= 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Request</CardTitle>
                <CardDescription>
                  Products you're requesting from this seller
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No products added yet. Select products from the list.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requestedProducts.map((product, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{product.name}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="mr-3">SKU: {product.sku}</span>
                          <span>Price: ${product.price?.toFixed(2) || '0.00'}</span>
                          <div className="mt-1 text-blue-600">
                            Available: {product.maxStock} units
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(index, product.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                            className="h-8 w-16 mx-2 text-center"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(index, product.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special instructions or notes for the seller..."
                    className="mt-1"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <Button
                  className="w-full"
                  disabled={requestedProducts.length === 0 || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestProducts;
