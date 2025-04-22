
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SellerSidebar } from '@/components/layout/SellerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { 
  Input,
  InputProps 
} from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertTriangle,
  Box,
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

// Mock inventory data
const inventoryItems = [
  { id: 1, sku: 'SKU001', name: 'Premium Headphones', category: 'Electronics', stock: 78, threshold: 15, price: 129.99, status: 'In Stock' },
  { id: 2, sku: 'SKU002', name: 'Wireless Mouse', category: 'Accessories', stock: 145, threshold: 20, price: 45.99, status: 'In Stock' },
  { id: 3, sku: 'SKU003', name: 'Smart Watch', category: 'Wearables', stock: 32, threshold: 10, price: 199.99, status: 'In Stock' },
  { id: 4, sku: 'SKU004', name: 'Bluetooth Speaker', category: 'Audio', stock: 8, threshold: 12, price: 89.99, status: 'Low Stock' },
  { id: 5, sku: 'SKU005', name: 'USB-C Charger', category: 'Accessories', stock: 7, threshold: 25, price: 29.99, status: 'Low Stock' },
  { id: 6, sku: 'SKU006', name: 'Laptop Stand', category: 'Accessories', stock: 0, threshold: 15, price: 39.99, status: 'Out of Stock' },
  { id: 7, sku: 'SKU007', name: 'Webcam HD', category: 'Electronics', stock: 56, threshold: 10, price: 79.99, status: 'In Stock' },
  { id: 8, sku: 'SKU008', name: 'Gaming Keyboard', category: 'Gaming', stock: 3, threshold: 8, price: 149.99, status: 'Low Stock' },
  { id: 9, sku: 'SKU009', name: 'Wireless Earbuds', category: 'Audio', stock: 112, threshold: 20, price: 99.99, status: 'In Stock' },
  { id: 10, sku: 'SKU010', name: 'Portable SSD', category: 'Storage', stock: 24, threshold: 5, price: 159.99, status: 'In Stock' },
];

const categoryCount = {
  'Electronics': 2,
  'Accessories': 3,
  'Wearables': 1,
  'Audio': 2,
  'Gaming': 1,
  'Storage': 1
};

const inventoryStats = {
  total: inventoryItems.length,
  inStock: inventoryItems.filter(item => item.status === 'In Stock').length,
  lowStock: inventoryItems.filter(item => item.status === 'Low Stock').length,
  outOfStock: inventoryItems.filter(item => item.status === 'Out of Stock').length,
};

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'low-stock') return matchesSearch && item.status === 'Low Stock';
    if (activeTab === 'out-of-stock') return matchesSearch && item.status === 'Out of Stock';
    return matchesSearch;
  });

  const handleCsvUpload = () => {
    toast({
      title: "CSV File Uploaded",
      description: "Your inventory has been updated with the new products.",
    });
  };
  
  const handleExportInventory = () => {
    toast({
      title: "Export Started",
      description: "Your inventory data is being exported to CSV.",
    });
  };

  const columns = [
    { 
      key: 'sku', 
      header: 'SKU',
      cell: (row: any) => <span className="font-medium">{row.sku}</span>
    },
    { 
      key: 'name', 
      header: 'Product Name' 
    },
    { 
      key: 'category', 
      header: 'Category',
      cell: (row: any) => (
        <Badge variant="outline" className="bg-gray-50">
          {row.category}
        </Badge>
      )
    },
    { 
      key: 'stock', 
      header: 'Stock',
      cell: (row: any) => <span className="font-medium">{row.stock}</span>
    },
    { 
      key: 'threshold', 
      header: 'Threshold' 
    },
    { 
      key: 'price', 
      header: 'Price',
      cell: (row: any) => <span className="font-medium">${row.price}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      cell: (row: any) => {
        const variant = 
          row.status === 'In Stock' ? 'success' : 
          row.status === 'Low Stock' ? 'outline' : 'destructive';
        
        const icon = row.status !== 'In Stock' ? (
          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
        ) : null;
        
        return (
          <Badge variant={variant} className="flex w-fit items-center">
            {icon}
            {row.status}
          </Badge>
        );
      }
    },
    { 
      key: 'actions', 
      header: '',
      cell: () => (
        <div className="flex space-x-2 justify-end">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="outline" size="sm">View</Button>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout
      sidebar={<SellerSidebar />}
      header={<DashboardHeader title="Inventory Management" userType="seller" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={inventoryStats.total}
          icon={<Box className="h-5 w-5" />}
          trend={{ value: 4.5, isPositive: true }}
        />
        <StatCard
          title="In Stock"
          value={inventoryStats.inStock}
          icon={<Box className="h-5 w-5" />}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Low Stock"
          value={inventoryStats.lowStock}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{ value: 1.8, isPositive: false }}
        />
        <StatCard
          title="Out of Stock"
          value={inventoryStats.outOfStock}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{ value: 0.5, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Filter Inventory</DialogTitle>
                        <DialogDescription>
                          Select the filters to apply to your inventory.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select>
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {Object.keys(categoryCount).map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category} ({categoryCount[category as keyof typeof categoryCount]})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select>
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="in-stock">In Stock</SelectItem>
                              <SelectItem value="low-stock">Low Stock</SelectItem>
                              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Reset</Button>
                        <Button>Apply Filters</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Products</DialogTitle>
                        <DialogDescription>
                          Upload a CSV file to bulk import products to your inventory.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                          <div className="text-sm text-gray-600 mb-2">
                            Drag and drop your CSV file, or click to browse
                          </div>
                          <Input
                            type="file"
                            className="hidden"
                            id="csvUpload"
                            accept=".csv"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              document.getElementById('csvUpload')?.click();
                            }}
                          >
                            Select CSV File
                          </Button>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Template</div>
                          <div className="text-xs text-gray-500">
                            Download our <a href="#" className="text-primary">CSV template</a> to ensure your data is formatted correctly.
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={handleCsvUpload}>Upload and Import</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" onClick={handleExportInventory} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                          Fill in the product details to add it to your inventory.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" placeholder="Enter SKU code" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                              <SelectTrigger id="category">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(categoryCount).map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input id="name" placeholder="Enter product name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" placeholder="0.00" type="number" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" placeholder="0" type="number" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="threshold">Low Stock Threshold</Label>
                            <Input id="threshold" placeholder="0" type="number" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Add Product</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Products ({inventoryItems.length})</TabsTrigger>
                  <TabsTrigger value="low-stock">Low Stock ({inventoryStats.lowStock})</TabsTrigger>
                  <TabsTrigger value="out-of-stock">Out of Stock ({inventoryStats.outOfStock})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="m-0">
                  <div className="rounded-md border overflow-hidden">
                    <DataTable
                      title=""
                      columns={columns}
                      data={filteredItems}
                      emptyMessage="No products found. Try adjusting your search."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="low-stock" className="m-0">
                  <div className="rounded-md border overflow-hidden">
                    <DataTable
                      title=""
                      columns={columns}
                      data={filteredItems}
                      emptyMessage="No low stock products found."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="out-of-stock" className="m-0">
                  <div className="rounded-md border overflow-hidden">
                    <DataTable
                      title=""
                      columns={columns}
                      data={filteredItems}
                      emptyMessage="No out of stock products found."
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(categoryCount).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                    <span>{category}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Manage Categories
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 space-y-2">
                <p>Learn how to effectively manage your inventory:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      CSV import guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Setting up stock alerts
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Inventory best practices
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Simplified UI components for the sake of this example
const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
    {children}
  </label>
);

const Select = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const SelectTrigger = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <Button variant="outline" className="w-full justify-between" id={id}>
    {children}
  </Button>
);

const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <span>{placeholder}</span>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
    {children}
  </div>
);

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{children}</div>
);

export default InventoryManagement;
