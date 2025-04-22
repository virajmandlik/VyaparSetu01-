import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SellerSidebar } from '@/components/layout/SellerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { partnershipAPI } from '@/lib/api';
import { Loader2, Users, CheckCircle, Clock, XCircle, Store } from 'lucide-react';

const PartnershipRequests = () => {
  const { toast } = useToast();
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

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

  const handleUpdateStatus = async (partnershipId: string, status: 'active' | 'rejected') => {
    try {
      setProcessingId(partnershipId);
      await partnershipAPI.updatePartnershipStatus(partnershipId, status);
      
      // Update local state
      setPartnerships(partnerships.filter(p => p.id !== partnershipId));
      
      toast({
        title: 'Success',
        description: `Partnership ${status === 'active' ? 'accepted' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating partnership status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update partnership status',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
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
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {partnershipsList.map((partnership) => (
          <Card key={partnership.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{partnership.retailer.name}</CardTitle>
                {getStatusBadge(partnership.status)}
              </div>
              <CardDescription>{partnership.retailer.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Request received on {new Date(partnership.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {partnership.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleUpdateStatus(partnership.id, 'active')}
                      disabled={processingId === partnership.id}
                    >
                      {processingId === partnership.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateStatus(partnership.id, 'rejected')}
                      disabled={processingId === partnership.id}
                    >
                      {processingId === partnership.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      Decline
                    </Button>
                  </div>
                )}
                {partnership.status === 'active' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = `/seller/messages/${partnership.id}`}
                  >
                    View Messages
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebar={<SellerSidebar />}
      header={<DashboardHeader title="Partnership Requests" userType="seller" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Partnership Requests</h2>
        </div>

        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading partnerships...</span>
            </div>
          ) : (
            <>
              <TabsContent value="pending">
                {renderPartnershipsList(partnerships.filter(p => p.status === 'pending'))}
              </TabsContent>
              
              <TabsContent value="active">
                {renderPartnershipsList(partnerships.filter(p => p.status === 'active'))}
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

export default PartnershipRequests;
