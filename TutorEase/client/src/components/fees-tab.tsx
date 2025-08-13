import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Mail, AlertTriangle } from "lucide-react";
import { type Fee, type Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FeesTab() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Current month
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: fees = [], isLoading } = useQuery<Fee[]>({
    queryKey: ['/api/fees', selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/fees?month=${selectedMonth}`);
      if (!response.ok) throw new Error('Failed to fetch fees');
      return response.json();
    },
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Fee> }) => 
      apiRequest('PUT', `/api/fees/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fees'] });
      toast({
        title: "Success",
        description: "Fee updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update fee",
        variant: "destructive",
      });
    },
  });

  const getStudent = (studentId: string) => {
    return students.find(student => student.id === studentId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const markAsPaid = (feeId: string) => {
    updateFeeMutation.mutate({
      id: feeId,
      updates: {
        status: 'paid',
        paidDate: new Date(),
      },
    });
  };

  // Calculate statistics
  const totalExpected = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const collected = fees
    .filter(fee => fee.status === 'paid')
    .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const pending = fees
    .filter(fee => fee.status === 'pending')
    .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const overdue = fees
    .filter(fee => fee.status === 'overdue')
    .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const collectionRate = totalExpected > 0 ? (collected / totalExpected * 100).toFixed(1) : '0.0';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Fees Overview */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Fee Management</h3>
              <div className="flex items-center space-x-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48" data-testid="select-fee-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-11">November 2024</SelectItem>
                    <SelectItem value="2024-10">October 2024</SelectItem>
                    <SelectItem value="2024-09">September 2024</SelectItem>
                    <SelectItem value="2024-08">August 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-secondary text-white hover:bg-secondary/90" data-testid="button-generate-bill">
                  Generate Bill
                </Button>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => {
                    const student = getStudent(fee.studentId);
                    if (!student) return null;
                    
                    return (
                      <TableRow key={fee.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {getInitials(student.name)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900" data-testid={`text-fee-student-${fee.id}`}>
                                {student.name}
                              </div>
                              <div className="text-xs text-gray-600">{student.grade}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-900">
                          ${parseFloat(fee.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(fee.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              data-testid={`button-view-receipt-${fee.id}`}
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                            {fee.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsPaid(fee.id)}
                                className="text-secondary hover:text-secondary/80"
                                data-testid={`button-mark-paid-${fee.id}`}
                              >
                                Mark Paid
                              </Button>
                            )}
                            {fee.status === 'overdue' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-send-reminder-${fee.id}`}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-secondary hover:text-secondary/80"
                                data-testid={`button-send-reminder-${fee.id}`}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {fees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No fee records found for this month.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Statistics */}
      <div className="space-y-6">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">This Month</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Expected</span>
                <span className="text-lg font-semibold text-gray-900" data-testid="stat-total-expected">
                  ${totalExpected.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Collected</span>
                <span className="text-lg font-semibold text-secondary" data-testid="stat-collected">
                  ${collected.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-lg font-semibold text-accent" data-testid="stat-pending">
                  ${pending.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="text-lg font-semibold text-red-600" data-testid="stat-overdue">
                  ${overdue.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Collection Rate</span>
                  <span className="text-xl font-bold text-secondary" data-testid="stat-collection-rate">
                    {collectionRate}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <Button className="w-full bg-secondary text-white hover:bg-secondary/90" data-testid="button-send-bulk-reminders">
                Send Bulk Reminders
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-export-fee-report">
                Export Fee Report
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-generate-invoices">
                Generate Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
