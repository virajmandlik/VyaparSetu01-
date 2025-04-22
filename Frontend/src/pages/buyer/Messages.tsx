import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BuyerSidebar } from '@/components/layout/BuyerSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { partnershipAPI, messageAPI } from '@/lib/api';
import { Loader2, Send, ArrowLeft } from 'lucide-react';

const Messages = () => {
  const { partnershipId } = useParams<{ partnershipId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [partnership, setPartnership] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (partnershipId) {
      fetchPartnershipDetails();
      fetchMessages();
      
      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [partnershipId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPartnershipDetails = async () => {
    try {
      const response = await partnershipAPI.getPartnershipDetails(partnershipId!);
      setPartnership(response.partnership);
    } catch (error: any) {
      console.error('Error fetching partnership details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load partnership details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages(partnershipId!);
      setMessages(response.messages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      setSending(true);
      await messageAPI.sendMessage(partnershipId!, messageText);
      setMessageText('');
      await fetchMessages(); // Refresh messages
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebar={<BuyerSidebar />}
        header={<DashboardHeader title="Messages" userType="buyer" />}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading messages...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!partnership) {
    return (
      <DashboardLayout
        sidebar={<BuyerSidebar />}
        header={<DashboardHeader title="Messages" userType="buyer" />}
      >
        <Card>
          <CardContent className="py-10 text-center">
            <div className="flex flex-col items-center justify-center">
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

  // Group messages by date
  const groupedMessages: { [key: string]: any[] } = {};
  messages.forEach(message => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <DashboardLayout
      sidebar={<BuyerSidebar />}
      header={<DashboardHeader title="Messages" userType="buyer" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => window.location.href = '/buyer/partnerships'}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Messages</h2>
              <p className="text-gray-500">
                Conversation with {partnership.seller.name}
              </p>
            </div>
          </div>
        </div>

        <Card className="flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader className="pb-2 border-b">
            <CardTitle>{partnership.seller.name}</CardTitle>
            <CardDescription>
              {partnership.seller.email}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow overflow-y-auto p-4">
            {Object.keys(groupedMessages).length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex justify-center mb-4">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {formatDate(date)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {dateMessages.map((message) => {
                        const isCurrentUser = message.sender.id === user?.id;
                        return (
                          <div 
                            key={message.id} 
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isCurrentUser 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="text-sm mb-1">
                                {message.content}
                              </div>
                              <div className={`text-xs ${isCurrentUser ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
