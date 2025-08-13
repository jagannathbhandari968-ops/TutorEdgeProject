import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

interface StatsData {
  totalStudents: number;
  classesToday: number;
  monthlyRevenue: number;
  avgAttendance: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/dashboard/stats'],
  });

  const statsConfig = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Classes Today",
      value: stats?.classesToday ?? 0,
      icon: Calendar,
      bgColor: "bg-green-100",
      iconColor: "text-secondary",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats?.monthlyRevenue?.toFixed(2) ?? '0.00'}`,
      icon: DollarSign,
      bgColor: "bg-amber-100",
      iconColor: "text-accent",
    },
    {
      title: "Avg Attendance",
      value: `${stats?.avgAttendance ?? 0}%`,
      icon: TrendingUp,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`${stat.iconColor} h-5 w-5`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
