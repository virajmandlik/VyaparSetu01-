
import React from 'react';
import {
  BarChart,
  Box,
  ClipboardList,
  FileText,
  Home,
  MessageSquare,
  Settings,
  ShoppingBag,
  Users
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLocation, Link } from 'react-router-dom';

export const SellerSidebar = () => {
  const location = useLocation();
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/seller' },
    { icon: Box, label: 'Inventory', path: '/seller/inventory' },
    { icon: ShoppingBag, label: 'Product Requests', path: '/seller/product-requests' },
    { icon: BarChart, label: 'Forecasting', path: '/seller/forecasting' },
    { icon: Users, label: 'Partnerships', path: '/seller/partnerships' },
    { icon: MessageSquare, label: 'Messages', path: '/seller/messages' },
    { icon: FileText, label: 'Reports', path: '/seller/reports' },
    { icon: Settings, label: 'Settings', path: '/seller/settings' },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-100 p-4">
        <Link to="/seller" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-retail-purple-500 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-retail-purple-800">Vyaparsetu</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild selected={location.pathname === item.path}>
                <Link to={item.path} className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-retail-purple-100 flex items-center justify-center">
            <span className="text-retail-purple-600 font-semibold">SD</span>
          </div>
          <div>
            <p className="text-sm font-medium">Seller Dashboard</p>
            <p className="text-xs text-gray-500">Supplier Mode</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
