
import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardHeaderProps {
  title: string;
  userType: 'seller' | 'buyer';
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, userType }) => {
  const { logout } = useAuth();
  return (
    <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-8 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-retail-purple-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userType === 'seller' ? (
              <>
                <DropdownMenuItem className="py-2">
                  <div>
                    <p className="font-medium">New order received</p>
                    <p className="text-sm text-gray-500">Order #12345 from RetailCo</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <div>
                    <p className="font-medium">Low stock alert</p>
                    <p className="text-sm text-gray-500">Product SKU-001 is running low</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <div>
                    <p className="font-medium">New partnership request</p>
                    <p className="text-sm text-gray-500">From TechMart Stores</p>
                  </div>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem className="py-2">
                  <div>
                    <p className="font-medium">Order status updated</p>
                    <p className="text-sm text-gray-500">Order #45678 is now shipped</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <div>
                    <p className="font-medium">Inventory recommendation</p>
                    <p className="text-sm text-gray-500">Consider restocking SKU-456</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <div>
                    <p className="font-medium">Partnership approved</p>
                    <p className="text-sm text-gray-500">From ElectroGoods Inc</p>
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback>{userType === 'seller' ? 'S' : 'R'}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-flex text-sm font-medium">
                {userType === 'seller' ? 'Seller Account' : 'Retailer Account'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
