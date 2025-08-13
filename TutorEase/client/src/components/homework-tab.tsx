import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Edit, Trash2, Users, CheckCircle, Clock, Star, CalendarIcon, Eye, Download, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHomeworkSchema, type Homework, type InsertHomework, type Class, type HomeworkSubmission } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function HomeworkTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: homework = [], isLoading } = useQuery<Homework[]>({
    queryKey: ['/api/homework'],
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });

  const form = useForm<InsertHomework>({
    resolver: zodResolver(insertHomeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      tutorId: "",
      dueDate: new Date(),
      status: "active",
      totalStudents: 0,
      submittedCount: 0,
    },
  });

  const createHomeworkMutation = useMutation({
    mutationFn: (data: InsertHomework) => apiRequest('POST', '/api/homework', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homework'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Homework assignment created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create homework assignment",
        variant: "destructive",
      });
    },
  });

  const deleteHomeworkMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/homework/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homework'] });
      toast({
        title: "Success",
        description: "Homework assignment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete homework assignment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertHomework) => {
    const selectedClass = classes.find(c => c.id === data.classId);
    const homeworkData = {
      ...data,
      totalStudents: selectedClass?.studentIds.length || 0,
      submittedCount: 0,
    };
    createHomeworkMutation.mutate(homeworkData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this homework assignment?')) {
      deleteHomeworkMutation.mutate(id);
    }
  };

  const getClassInfo = (classId: string) => {
    return classes.find(c => c.id === classId);
  };

  const getStatusBadge = (homework: Homework) => {
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    
    if (homework.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (dueDate < now) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    } else {
      return <Badge className="bg-amber-100 text-amber-800">Due: {format(dueDate, 'MMM dd')}</Badge>;
    }
  };

  // Calculate statistics
  const activeAssignments = homework.filter(hw => hw.status === 'active').length;
  const totalSubmissions = homework.reduce((sum, hw) => sum + hw.submittedCount, 0);
  const pendingReview = homework.reduce((sum, hw) => sum + (hw.totalStudents - hw.submittedCount), 0);
  const avgScore = 87; // This would come from actual submission data

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
      {/* Homework Management */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Homework Assignments</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white hover:bg-primary/90" data-testid="button-create-homework">
                    <Plus className="h-4 w-4 mr-2" />
                    New Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Assignment title" {...field} data-testid="input-homework-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Assignment instructions and requirements"
                                className="resize-none"
                                rows={3}
                                {...field}
                                data-testid="input-homework-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-homework-class">
                                  <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {classes.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="button-homework-due-date"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createHomeworkMutation.isPending}
                          data-testid="button-save-homework"
                        >
                          {createHomeworkMutation.isPending ? "Creating..." : "Create Assignment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <CardContent className="p-6">
            {homework.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No homework assignments created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {homework.map((assignment) => {
                  const classInfo = getClassInfo(assignment.classId);
                  return (
                    <div
                      key={assignment.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900" data-testid={`text-homework-title-${assignment.id}`}>
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {classInfo?.name} • Assigned {format(new Date(assignment.assignedDate!), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(assignment)}
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              data-testid={`button-edit-homework-${assignment.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(assignment.id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-homework-${assignment.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4">{assignment.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="mr-1 h-4 w-4" />
                            <span>{assignment.totalStudents} students</span>
                          </div>
                          <div className="flex items-center text-sm text-secondary">
                            <CheckCircle className="mr-1 h-4 w-4" />
                            <span>{assignment.submittedCount} submitted</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{assignment.totalStudents - assignment.submittedCount} pending</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                          data-testid={`button-view-submissions-${assignment.id}`}
                        >
                          View Submissions →
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Homework Statistics */}
      <div className="space-y-6">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">This Week</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Assignments</span>
                <span className="text-lg font-semibold text-primary" data-testid="stat-active-assignments">
                  {activeAssignments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Submissions</span>
                <span className="text-lg font-semibold text-secondary" data-testid="stat-total-submissions">
                  {totalSubmissions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Review</span>
                <span className="text-lg font-semibold text-accent" data-testid="stat-pending-review">
                  {pendingReview}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Score</span>
                <span className="text-lg font-semibold text-secondary" data-testid="stat-average-score">
                  {avgScore}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <Button className="w-full bg-primary text-white hover:bg-primary/90" data-testid="button-bulk-grading">
                Bulk Grading
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-download-submissions">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-send-homework-reminders">
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Alex Chen</div>
                  <div className="text-xs text-gray-600">Math Ch.5 - 2 min ago</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 text-sm"
                  data-testid="button-review-submission-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Emma Wilson</div>
                  <div className="text-xs text-gray-600">Physics Lab - 15 min ago</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 text-sm"
                  data-testid="button-review-submission-2"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
