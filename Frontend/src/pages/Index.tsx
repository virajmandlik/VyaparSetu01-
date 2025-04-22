
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ShoppingBag } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-retail-purple-50 to-white flex flex-col">
      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-retail-purple-600 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-retail-purple-800">Vyaparsetu</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Retail and Demand Forecasting System
          </h1>
          <p className="text-xl text-gray-600">
            Connect sellers and retailers with intelligent demand forecasting, inventory management, and seamless ordering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Card className="border-retail-purple-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-retail-purple-600" />
                Seller Dashboard
              </CardTitle>
              <CardDescription>
                For suppliers, manufacturers, and wholesale distributors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Inventory Management with CSV Import</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Order Processing & Tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Demand Forecasting & Analysis</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Retailer Partnership Management</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-retail-purple-600 hover:bg-retail-purple-700"
                onClick={() => navigate('/seller')}
              >
                Enter Seller Dashboard
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-retail-purple-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-5 w-5 text-retail-purple-600" />
                Buyer Dashboard
              </CardTitle>
              <CardDescription>
                For retailers, resellers, and store owners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Browse & Order Products</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Sales Management & Tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Retail Forecasting & Planning</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-retail-purple-500 mr-2"></div>
                  <span>Supplier Partnership Management</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-retail-purple-600 hover:bg-retail-purple-700"
                onClick={() => navigate('/buyer')}
              >
                Enter Buyer Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <img 
            src="/lovable-uploads/c8b05750-702c-4c35-9066-2513ebe5b67c.png" 
            alt="System Flow Diagram" 
            className="w-full h-auto rounded-lg shadow-md mb-4" 
          />
          <p className="text-gray-600">
            Our platform connects sellers and buyers through a streamlined partnership system,
            enabling efficient product ordering, sales management and advanced forecasting.
          </p>
        </div>
      </main>

      <footer className="bg-gray-50 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          RetailNexus &copy; 2023 - A Retail and Demand Forecasting Platform
        </div>
      </footer>
    </div>
  );
};

export default Index;
