import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHome from '@/components/admin/AdminHome';
import MemberManagement from '@/components/admin/MemberManagement';
import AttendanceRecords from '@/components/admin/AttendanceRecords';
import GpsTracking from '@/components/admin/GpsTracking';
import Reports from '@/components/admin/Reports';
import Settings from '@/components/admin/Settings';
import Help from '@/components/admin/Help';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Extract the page title from the current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/admin-dashboard') || path.endsWith('/admin-dashboard/')) {
      return 'Dashboard';
    }

    const pathSegments = path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Convert path segment to title case (e.g., "member-management" -> "Member Management")
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>

            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8"
                />
              </div>

              <div className="relative">
                <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-primary transition-colors" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                  3
                </span>
              </div>

              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">{user?.name}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="members" element={<MemberManagement />} />
            <Route path="attendance" element={<AttendanceRecords />} />
            <Route path="gps" element={<GpsTracking />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
