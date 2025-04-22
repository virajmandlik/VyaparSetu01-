
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  header
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 flex w-full">
          {sidebar}
          <div className="flex-1 flex flex-col">
            {header}
            <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </SidebarProvider>
  );
};
