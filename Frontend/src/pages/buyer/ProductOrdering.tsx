
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Filter,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Store,
  PackageOpen,
  Star,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data
const products = [
  { 
    id: 1, 
    name: 'Wireless Earbuds Pro', 
    category: 'Audio', 
    price: 129.99, 
    supplier: 'AudioTech', 
    rating: 4.8,
    stock: 45,
    image: '/placeholder.svg',
    description: 'Premium wireless earbuds with noise cancellation and 24-hour battery life.'
  },
  { 
    id: 2, 
    name: 'Smart Watch Series 5', 
    category: 'Wearables', 
    price: 249.99, 
    supplier: 'TechGear', 
    rating: 4.6,
    stock: 32,
    image: '/placeholder.svg',
    description: 'Advanced smartwatch with health monitoring and always-on display.'
  },
  { 
    id: 3, 
    name: 'Portable Bluetooth Speaker', 
    category: 'Audio', 
    price: 89.99, 
    supplier: 'SoundSystems', 
    rating: 4.5,
    stock: 28,
    image: '/placeholder.svg',
    description: 'Waterproof portable speaker with 20-hour battery life and deep bass.'
  },
  { 
    id: 4, 
    name: 'USB-C Fast Charger', 
    category: 'Accessories', 
    price: 39.99, 
    supplier: 'PowerPlus', 
    rating: 4.7,
    stock: 64,
    image: '/placeholder.svg',
    description: '65W fast charger compatible with laptops, phones, and tablets.'
  },
  { 
    id: 5, 
    name: 'Wireless Ergonomic Mouse', 
    category: 'Accessories', 
    price: 59.99, 
    supplier: 'TechSupplies', 
    rating: 4.4,
    stock: 41,
    image: '/placeholder.svg',
    description: 'Ergonomic design with customizable buttons and long battery life.'
  },
  { 
    id: 6, 
    name: '4K Webcam', 
    category: 'Electronics', 
    price: 129.99, 
    supplier: 'VisualTech', 
    rating: 4.6,
    stock: 18,
    image: '/placeholder.svg',
    description: 'Ultra HD webcam with auto light correction and noise-cancelling microphones.'
  },
  { 
    id: 7, 
    name: 'Mechanical Keyboard', 
    category: 'Accessories', 
    price: 149.99, 
    supplier: 'TechSupplies', 
    rating: 4.8,
    stock: 25,
    image: '/placeholder.svg',
    description: 'RGB backlit mechanical keyboard with customizable switches.'
  },
  { 
    id: 8, 
    name: 'Portable SSD 1TB', 
    category: 'Storage', 
    price: 179.99, 
    supplier: 'DataStore', 
    rating: 4.9,
    stock: 22,
    image: '/placeholder.svg',
    description: 'Ultra-fast portable SSD with 1TB capacity and durable metal casing.'
  },
];

const suppliers = [
  { id: 1, name: 'AudioTech', category: 'Audio', products: 45, rating: 4.8 },
  { id: 2, name: 'TechGear', category: 'Wearables', products: 38, rating: 4.6 },
  { id: 3, name: 'SoundSystems', category: 'Audio', products: 29, rating: 4.5 },
  { id: 4, name: 'PowerPlus', category: 'Accessories', products: 64, rating: 4.7 },
  { id: 5, name: 'TechSupplies', category: 'Mixed', products: 127, rating: 4.6 },
  { id: 6, name: 'VisualTech', category: 'Electronics', products: 42, rating: 4.4 },
  { id: 7, name: 'DataStore', category: 'Storage', products: 31, rating: 4.9 },
];

const categories = [
  'All',
  'Audio',
  'Wearables',
  'Accessories',
  'Electronics',
  'Storage',
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  supplier: string;
};

const ProductOrdering = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      || product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    return 0; // featured
  });

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: typeof products[0], quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...prevCart, { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          quantity, 
          supplier: product.supplier 
        }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const updateCartItemQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    toast({
      title: "Order Submitted",
      description: `Your order has been sent to the suppliers for processing.`,
    });
    setCart([]);
  };

  const productModal = (
    <Dialog>
      <DialogContent className="sm:max-w-[600px]">
        {selectedProduct && (
          <>
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Product details and ordering information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Supplier</div>
                  <div className="font-medium">{selectedProduct.supplier}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div>{selectedProduct.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-lg font-bold">${selectedProduct.price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1">{selectedProduct.rating}/5</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Availability</div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      In Stock: {selectedProduct.stock} units
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-2">
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-sm text-gray-600">{selectedProduct.description}</p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
              <Button onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Product Ordering" userType="buyer" />}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Browse Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder={activeTab === 'products' ? "Search products..." : "Search suppliers..."}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {activeTab === 'products' && (
                  <>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              <Tabs defaultValue="products" onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="products" className="flex items-center">
                    <PackageOpen className="mr-2 h-4 w-4" />
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="suppliers" className="flex items-center">
                    <Store className="mr-2 h-4 w-4" />
                    Suppliers
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="products" className="m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedProducts.length > 0 ? (
                      sortedProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="aspect-video bg-gray-100 relative">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-2 right-2" variant="secondary">
                              {product.category}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm text-gray-500">{product.supplier}</div>
                              <div className="flex items-center">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs ml-1">{product.rating}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  Details
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-3 py-8 text-center text-gray-500">
                        No products found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="suppliers" className="m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <Card key={supplier.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{supplier.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{supplier.name}</h3>
                                <div className="text-sm text-gray-500">{supplier.category}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-sm text-gray-500">Products</div>
                                <div className="font-medium">{supplier.products}</div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-sm text-gray-500">Rating</div>
                                <div className="font-medium flex items-center justify-center">
                                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                                  {supplier.rating}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full">
                              View Products
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-3 py-8 text-center text-gray-500">
                        No suppliers found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span>Shopping Cart</span>
                <Badge variant="secondary">
                  {getTotalItems()} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between pb-3 border-b">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.supplier}</div>
                        <div className="text-sm">${item.price.toFixed(2)} each</div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1 mt-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-1 text-sm w-5 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-sm">Estimated Tax:</span>
                      <span className="font-medium">${(getTotalPrice() * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total:</span>
                      <span>${(getTotalPrice() * 1.08).toFixed(2)}</span>
                    </div>
                    
                    <Button className="w-full" onClick={handleCheckout}>
                      <Package className="mr-2 h-4 w-4" />
                      Place Order
                    </Button>
                    <Button variant="outline" className="w-full mt-2" onClick={() => setCart([])}>
                      Clear Cart
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <ShoppingCart className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                  <p>Your cart is empty</p>
                  <p className="text-sm mt-1">Browse products and add them to your cart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Product details modal */}
      {selectedProduct && productModal}
    </DashboardLayout>
  );
};

export default ProductOrdering;
