import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Settings,
  FileText,
  Activity,
  BarChart3,
  UserPlus
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "tutor", "student", "parent"])
});

type UserFormData = z.infer<typeof userFormSchema>;

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [userRole, setUserRole] = useState<string>("all");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dashboard stats query
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: true
  });

  // Users query
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users", userRole],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users${userRole !== "all" ? `?role=${userRole}` : ""}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: true
  });

  // System logs query
  const { data: systemLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/system-logs"],
    enabled: selectedTab === "logs"
  });

  // User reports query
  const { data: userReport, isLoading: userReportLoading } = useQuery({
    queryKey: ["/api/admin/reports/users"],
    enabled: selectedTab === "reports"
  });

  // Financial reports query
  const { data: financialReport, isLoading: financialReportLoading } = useQuery({
    queryKey: ["/api/admin/reports/financial"],
    enabled: selectedTab === "reports"
  });

  // Create user form
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student"
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      toast({ title: "User created successfully" });
      setIsUserDialogOpen(false);
      userForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    }
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      toast({ title: "User status updated successfully" });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      toast({ title: "User deleted successfully" });
    }
  });

  const handleCreateUser = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  const handleToggleUserStatus = (id: string, currentStatus: boolean) => {
    updateUserStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(id);
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="admin-dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Complete control over the EduManage platform
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5" data-testid="admin-tabs">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="logs" data-testid="tab-logs">System Logs</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="stat-total-users">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboardStats as any)?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {(dashboardStats as any)?.activeUsers || 0} active users
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-total-students">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Students</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboardStats as any)?.totalStudents || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {(dashboardStats as any)?.totalClasses || 0} active classes
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-total-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(dashboardStats as any)?.totalRevenue?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${(dashboardStats as any)?.monthlyRevenue?.toFixed(2) || "0.00"} this month
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-attendance">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dashboardStats as any)?.avgAttendance || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Across all classes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setIsUserDialogOpen(true)}
                    className="flex items-center gap-2"
                    data-testid="button-add-user"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add New User
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedTab("reports")}
                    className="flex items-center gap-2"
                    data-testid="button-view-reports"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View Reports
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedTab("logs")}
                    className="flex items-center gap-2"
                    data-testid="button-view-logs"
                  >
                    <Activity className="h-4 w-4" />
                    System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger className="w-48" data-testid="select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="tutor">Tutors</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => setIsUserDialogOpen(true)}
                data-testid="button-add-user-tab"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(users as any[]).map((user: any) => (
                        <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? format(new Date(user.lastLogin), "MMM dd, yyyy") : "Never"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                data-testid={`button-toggle-status-${user.id}`}
                              >
                                {user.isActive ? (
                                  <XCircle className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                                data-testid={`button-delete-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8">Loading system logs...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(systemLogs as any[]).slice(0, 50).map((log: any) => (
                        <TableRow key={log.id} data-testid={`log-row-${log.id}`}>
                          <TableCell className="text-sm">
                            {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.adminId}</TableCell>
                          <TableCell>
                            {log.targetType}: {log.targetId}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {JSON.stringify(log.details)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userReportLoading ? (
                    <div className="text-center py-8">Loading user report...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {(userReport as any)?.totalUsers || 0}
                          </div>
                          <div className="text-sm text-blue-600">Total Users</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {(userReport as any)?.activeUsers || 0}
                          </div>
                          <div className="text-sm text-green-600">Active Users</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">By Role:</h4>
                        {(userReport as any)?.byRole && Object.entries((userReport as any).byRole).map(([role, count]: [string, any]) => (
                          <div key={role} className="flex justify-between items-center py-2 border-b">
                            <span className="capitalize">{role}s</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {financialReportLoading ? (
                    <div className="text-center py-8">Loading financial report...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            ${(financialReport as any)?.totalRevenue?.toFixed(2) || "0.00"}
                          </div>
                          <div className="text-sm text-green-600">Total Revenue</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            ${(financialReport as any)?.monthlyRevenue?.toFixed(2) || "0.00"}
                          </div>
                          <div className="text-sm text-blue-600">This Month</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Fee Status:</h4>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span>Paid Fees</span>
                          <Badge variant="default">{(financialReport as any)?.paidFees || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span>Pending Fees</span>
                          <Badge variant="secondary">{(financialReport as any)?.pendingFees || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span>Overdue Fees</span>
                          <Badge variant="destructive">{(financialReport as any)?.overdueFees || 0}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  System settings configuration coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={userForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-user-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-user-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} data-testid="input-user-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-user-role-dialog">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="tutor">Tutor</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUserDialogOpen(false)}
                    data-testid="button-cancel-user"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    data-testid="button-submit-user"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;