import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "students", label: "Students" },
  { id: "classes", label: "Classes" },
  { id: "attendance", label: "Attendance" },
  { id: "fees", label: "Fees" },
  { id: "homework", label: "Homework" },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <GraduationCap className="text-white text-sm h-4 w-4" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">EduManage</h1>
            </div>
            <div className="ml-8 flex space-x-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    activeTab === tab.id
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                  3
                </Badge>
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">New student enrollment</div>
                      <div className="text-xs text-gray-600 mt-1">Alex Chen joined Mathematics Grade 10</div>
                      <div className="text-xs text-gray-500 mt-1">2 minutes ago</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">Fee payment received</div>
                      <div className="text-xs text-gray-600 mt-1">Emma Wilson paid $250 for November</div>
                      <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">Homework submitted</div>
                      <div className="text-xs text-gray-600 mt-1">5 students submitted Physics assignments</div>
                      <div className="text-xs text-gray-500 mt-1">3 hours ago</div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </Button>
                    <Button size="sm" className="flex-1">
                      Mark All Read
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{user?.name ? getInitials(user.name) : "U"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
