import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { partnershipAPI } from '@/lib/api';
import { Loader2, Search, Store, CheckCircle, Clock, XCircle } from 'lucide-react';

const FindSellers = () => {
  const { toast } = useToast();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await partnershipAPI.getAvailableSellers();
      setSellers(response.sellers);
    } catch (error: any) {
      console.error('Error fetching sellers:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load sellers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPartnership = async (sellerId: string) => {
    try {
      setRequestingId(sellerId);
      await partnershipAPI.createPartnershipRequest(sellerId);
      
      // Update the local state to reflect the new partnership request
      setSellers(sellers.map(seller => 
        seller.id === sellerId 
          ? { ...seller, partnershipStatus: 'pending' } 
          : seller
      ));
      
      toast({
        title: 'Success',
        description: 'Partnership request sent successfully',
      });
    } catch (error: any) {
      console.error('Error requesting partnership:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send partnership request',
        variant: 'destructive',
      });
    } finally {
      setRequestingId(null);
    }
  };

  const filteredSellers = sellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPartnershipStatusBadge = (status: string | null) => {
    if (!status) {
      return null;
    }
    
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

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Find Sellers" userType="buyer" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Available Sellers</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sellers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading sellers...</span>
          </div>
        ) : filteredSellers.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <Store className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">No sellers found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm ? 'Try a different search term' : 'There are no sellers available at the moment'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => (
              <Card key={seller.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{seller.name}</CardTitle>
                    {getPartnershipStatusBadge(seller.partnershipStatus)}
                  </div>
                  <CardDescription>{seller.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This seller can provide products for your inventory.
                  </p>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  {!seller.partnershipStatus ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleRequestPartnership(seller.id)}
                      disabled={requestingId === seller.id}
                    >
                      {requestingId === seller.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        'Request Partnership'
                      )}
                    </Button>
                  ) : seller.partnershipStatus === 'active' ? (
                    <Button className="w-full" variant="outline" onClick={() => window.location.href = `/buyer/partnerships/${seller.id}`}>
                      View Partnership
                    </Button>
                  ) : seller.partnershipStatus === 'pending' ? (
                    <Button className="w-full" variant="outline" disabled>
                      Request Pending
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" onClick={() => handleRequestPartnership(seller.id)}>
                      Request Again
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindSellers;
