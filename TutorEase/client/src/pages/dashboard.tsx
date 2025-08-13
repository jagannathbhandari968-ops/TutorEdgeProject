import { useState } from "react";
import Navigation from "@/components/navigation";
import StatsCards from "@/components/stats-cards";
import StudentsTab from "@/components/students-tab";
import AttendanceTab from "@/components/attendance-tab";
import FeesTab from "@/components/fees-tab";
import HomeworkTab from "@/components/homework-tab";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, DollarSign, ClipboardCheck, CheckCircle, BellRing, FileText, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "students":
        return <StudentsTab />;
      case "classes":
        return <ClassesTab />;
      case "attendance":
        return <AttendanceTab />;
      case "fees":
        return <FeesTab />;
      case "homework":
        return <HomeworkTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

function OverviewTab() {
  return (
    <div>
      <StatsCards />
      
      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="text-primary text-sm h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New student enrollment</p>
                    <p className="text-sm text-gray-600">Alex Chen joined Mathematics Grade 10</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="text-secondary text-sm h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Fee payment received</p>
                    <p className="text-sm text-gray-600">Emma Wilson paid $250 for November</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="text-purple-600 text-sm h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Homework submitted</p>
                    <p className="text-sm text-gray-600">5 students submitted Physics Chapter 3 assignments</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <Button className="w-full bg-primary text-white p-4 rounded-lg text-left hover:bg-primary/90 transition-colors h-auto" data-testid="button-mark-attendance">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">Mark Attendance</div>
                    <div className="text-sm opacity-90">Take attendance for today's classes</div>
                  </div>
                </div>
              </Button>
              
              <Button className="w-full bg-secondary text-white p-4 rounded-lg text-left hover:bg-secondary/90 transition-colors h-auto" data-testid="button-send-announcement">
                <div className="flex items-center">
                  <BellRing className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">Send Announcement</div>
                    <div className="text-sm opacity-90">Notify students and parents</div>
                  </div>
                </div>
              </Button>
              
              <Button className="w-full bg-accent text-white p-4 rounded-lg text-left hover:bg-accent/90 transition-colors h-auto" data-testid="button-assign-homework">
                <div className="flex items-center">
                  <FileText className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">Assign Homework</div>
                    <div className="text-sm opacity-90">Create new assignments</div>
                  </div>
                </div>
              </Button>
              
              <Button className="w-full bg-purple-600 text-white p-4 rounded-lg text-left hover:bg-purple-700 transition-colors h-auto" data-testid="button-generate-report">
                <div className="flex items-center">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">Generate Reports</div>
                    <div className="text-sm opacity-90">View analytics and insights</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ClassesTab() {
  return (
    <Card className="shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Class Management</h3>
      </div>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          Class management functionality coming soon...
        </div>
      </CardContent>
    </Card>
  );
}
