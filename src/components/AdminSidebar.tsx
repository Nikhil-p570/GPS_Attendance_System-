
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MapPin, 
  BarChart, 
  Settings, 
  HelpCircle,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/admin-dashboard' 
  },
  { 
    icon: Users, 
    label: 'Member Management', 
    href: '/admin-dashboard/members' 
  },
  { 
    icon: Calendar, 
    label: 'Attendance Records', 
    href: '/admin-dashboard/attendance' 
  },
  { 
    icon: MapPin, 
    label: 'GPS Tracking', 
    href: '/admin-dashboard/gps' 
  },
  { 
    icon: BarChart, 
    label: 'Reports', 
    href: '/admin-dashboard/reports' 
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    href: '/admin-dashboard/settings' 
  },
  { 
    icon: HelpCircle, 
    label: 'Help', 
    href: '/admin-dashboard/help' 
  },
];

const AdminSidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="h-screen bg-white border-r shadow-sm p-4 flex flex-col w-64">
      <div className="flex items-center mb-8 px-2">
        <div className="bg-primary p-2 rounded-full">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <h1 className="ml-2 text-xl font-bold">GPS Attendance</h1>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/admin-dashboard'}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-white" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <item.icon className="h-5 w-5 mr-2" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <button 
          onClick={logout}
          className="flex items-center px-3 py-2 w-full text-left rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
