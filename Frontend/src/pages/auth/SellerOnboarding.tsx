import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Upload, Check, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const { user, completeRegistration } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [skipCsv, setSkipCsv] = useState(false);

  // Redirect if user is not logged in or is not a seller
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'seller') {
      navigate('/buyer');
      return;
    }

    if (user.registrationComplete) {
      navigate('/seller');
      return;
    }
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    // Read and preview the CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\\n').map(line => line.split(','));
      setCsvPreview(lines.slice(0, 5)); // Preview first 5 lines
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (skipCsv) {
        await completeRegistration();
        toast({
          title: 'Registration Complete',
          description: 'Your account has been set up successfully.',
        });
      } else if (csvFile) {
        await completeRegistration(csvFile);
        toast({
          title: 'CSV Uploaded Successfully',
          description: 'Your products and sales data have been imported.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Please upload a CSV file or choose to skip this step.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      navigate('/seller');
    } catch (error: any) {
      console.error('CSV upload error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload CSV file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipCsv(true);
    setLoading(true);
    
    try {
      await completeRegistration();
      toast({
        title: 'Registration Complete',
        description: 'Your account has been set up. You can upload your data later.',
      });
      navigate('/seller');
    } catch (error: any) {
      console.error('Registration completion error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete registration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = [
      'sku,name,category,price,stock,threshold,sale_date,sale_quantity',
      'SKU001,Premium Headphones,Electronics,129.99,78,15,2023-01-15,12',
      'SKU002,Wireless Mouse,Accessories,45.99,145,20,2023-01-20,8',
      'SKU003,Smart Watch,Wearables,199.99,32,10,2023-02-05,5'
    ].join('\\n');
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Seller Account Setup</CardTitle>
          <CardDescription>
            Upload your products and sales data to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Upload Products & Sales CSV</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {csvFile ? (
                  <div className="space-y-2">
                    <Check className="h-10 w-10 mx-auto text-green-500" />
                    <p className="font-medium">{csvFile.name}</p>
                    <p className="text-sm text-gray-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCsvFile(null);
                        setCsvPreview([]);
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-600 mb-2">
                      Drag and drop your CSV file, or click to browse
                    </div>
                    <Input
                      type="file"
                      className="hidden"
                      id="csvUpload"
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        document.getElementById('csvUpload')?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select CSV File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <Label>CSV Preview</Label>
                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {csvPreview[0].map((header, i) => (
                          <th 
                            key={i}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {csvPreview.slice(1).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 text-sm text-gray-500">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>CSV Template</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="text-primary"
                  onClick={downloadTemplate}
                >
                  Download Template
                </Button>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Required Format</AlertTitle>
                <AlertDescription>
                  Your CSV file must include the following columns: sku, name, category, price, stock, threshold, sale_date, sale_quantity
                </AlertDescription>
              </Alert>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="ghost" onClick={handleSkip} disabled={loading}>
            Skip for now (You can upload data later)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SellerOnboarding;
