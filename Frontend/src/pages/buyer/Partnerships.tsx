import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { partnershipAPI } from '@/lib/api';
import { Loader2, Store, CheckCircle, Clock, XCircle, MessageSquare, ShoppingBag } from 'lucide-react';

const Partnerships = () => {
  const { toast } = useToast();
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchPartnerships(activeTab);
  }, [activeTab]);

  const fetchPartnerships = async (status?: string) => {
    try {
      setLoading(true);
      const response = await partnershipAPI.getPartnerships(status);
      setPartnerships(response.partnerships);
    } catch (error: any) {
      console.error('Error fetching partnerships:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load partnerships',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
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

  const renderPartnershipsList = (partnershipsList: any[]) => {
    if (partnershipsList.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <Store className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No partnerships found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'active' 
                  ? 'You don\'t have any active partnerships yet' 
                  : activeTab === 'pending' 
                    ? 'You don\'t have any pending partnership requests' 
                    : 'You don\'t have any rejected partnerships'}
              </p>
              {activeTab !== 'pending' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = '/buyer/find-sellers'}
                >
                  Find Sellers
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partnershipsList.map((partnership) => (
          <Card key={partnership.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{partnership.seller.name}</CardTitle>
                {getStatusBadge(partnership.status)}
              </div>
              <CardDescription>{partnership.seller.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Partnership created on {new Date(partnership.createdAt).toLocaleDateString()}
              </p>
              {partnership.status === 'active' && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `/buyer/messages/${partnership.id}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `/buyer/request-products/${partnership.id}`}
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Request Products
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <Button 
                className="w-full" 
                variant={partnership.status === 'active' ? 'default' : 'outline'}
                onClick={() => window.location.href = `/buyer/partnerships/${partnership.id}`}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Partnerships" userType="buyer" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Partnerships</h2>
          <Button onClick={() => window.location.href = '/buyer/find-sellers'}>
            Find New Sellers
          </Button>
        </div>

        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading partnerships...</span>
            </div>
          ) : (
            <>
              <TabsContent value="active">
                {renderPartnershipsList(partnerships.filter(p => p.status === 'active'))}
              </TabsContent>
              
              <TabsContent value="pending">
                {renderPartnershipsList(partnerships.filter(p => p.status === 'pending'))}
              </TabsContent>
              
              <TabsContent value="rejected">
                {renderPartnershipsList(partnerships.filter(p => p.status === 'rejected'))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Partnerships;
