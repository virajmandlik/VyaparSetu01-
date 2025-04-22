import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { retailerAPI } from '@/lib/api';
import { Loader2, Search, Package, AlertTriangle, DollarSign } from 'lucide-react';

const Inventory = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sellingProduct, setSellingProduct] = useState<string | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<number>(1);

  useEffect(() => {
    fetchInventory();

    // Set up an interval to refresh inventory every 30 seconds
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing inventory...');
      fetchInventory();
    }, 30000);

    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      console.log('Fetching retailer inventory...');
      const response = await retailerAPI.getInventory();
      console.log('Retailer inventory response:', response);
      setInventory(response.inventory || []);
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTestInventory = async () => {
    try {
      console.log('Adding test inventory item...');
      const response = await retailerAPI.testAddInventory();
      console.log('Test inventory response:', response);
      toast({
        title: 'Success',
        description: 'Test inventory item added successfully',
      });
      fetchInventory(); // Refresh inventory after adding test item
    } catch (error: any) {
      console.error('Error adding test inventory:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add test inventory',
        variant: 'destructive',
      });
    }
  };

  const handleRecordSale = async (productId: string) => {
    try {
      setSellingProduct(productId);
      await retailerAPI.recordSale(productId, saleQuantity);

      // Update local inventory
      setInventory(inventory.map(item =>
        item.id === productId
          ? { ...item, stock: item.stock - saleQuantity }
          : item
      ));

      toast({
        title: 'Success',
        description: `Sale of ${saleQuantity} units recorded successfully`,
      });

      // Reset sale quantity
      setSaleQuantity(1);
    } catch (error: any) {
      console.error('Error recording sale:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record sale',
        variant: 'destructive',
      });
    } finally {
      setSellingProduct(null);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Out of Stock
        </Badge>
      );
    } else if (stock <= threshold) {
      return (
        <Badge variant="warning" className="flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
          <Package className="h-3 w-3" />
          In Stock
        </Badge>
      );
    }
  };

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Inventory" userType="buyer" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Inventory</h2>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inventory..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchInventory} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
            <Button variant="secondary" onClick={addTestInventory} disabled={loading}>
              Add Test Item
            </Button>
            <Button variant="destructive" onClick={() => {
              // Direct test - create an inventory item in the UI
              const newItem = {
                id: 'local-test-' + Date.now(),
                sku: 'LOCAL001',
                name: 'Local Test Product',
                category: 'Test',
                price: 99.99,
                stock: 50,
                threshold: 10,
                seller: {
                  id: '680789ef7c1ac7df2240521d',
                  name: 'Test Seller'
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              // Add to local state
              setInventory(prev => [...prev, newItem]);

              toast({
                title: 'Success',
                description: 'Local test item added to UI (not saved to database)',
              });
            }}>
              Add Local Test Item
            </Button>
            <Button onClick={() => window.location.href = '/buyer/partnerships'}>
              Find Products
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Manage your product inventory and record sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading inventory...</span>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No inventory items found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm
                    ? 'Try a different search term'
                    : 'Your inventory is empty. Request products from sellers to get started.'}
                </p>
                {!searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.href = '/buyer/partnerships'}
                  >
                    Find Sellers
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{getStockStatus(item.stock, item.threshold)}</TableCell>
                        <TableCell>{item.seller.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {item.stock > 0 ? (
                              <>
                                <Input
                                  type="number"
                                  min="1"
                                  max={item.stock}
                                  value={item.id === sellingProduct ? saleQuantity : 1}
                                  onChange={(e) => setSaleQuantity(parseInt(e.target.value) || 1)}
                                  className="w-16 h-8"
                                  disabled={sellingProduct === item.id}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRecordSale(item.id)}
                                  disabled={sellingProduct === item.id}
                                >
                                  {sellingProduct === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      Sell
                                    </>
                                  )}
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                              >
                                Out of Stock
                              </Button>
                            )}
                          </div>
                        </TableCell>
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

export default Inventory;
