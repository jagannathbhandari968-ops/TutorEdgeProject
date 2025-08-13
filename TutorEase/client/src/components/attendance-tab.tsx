import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type Student, type Class, type InsertAttendance } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
}

export default function AttendanceTab() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(student => 
    selectedClass?.studentIds.includes(student.id)
  );

  const saveAttendanceMutation = useMutation({
    mutationFn: (data: InsertAttendance[]) => apiRequest('POST', '/api/attendance/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
      setAttendanceRecords([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    },
  });

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => {
      const existing = prev.find(record => record.studentId === studentId);
      if (existing) {
        return prev.map(record => 
          record.studentId === studentId ? { ...record, status } : record
        );
      } else {
        return [...prev, { studentId, status }];
      }
    });
  };

  const handleSaveAttendance = () => {
    if (!selectedClassId) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    const attendanceData: InsertAttendance[] = classStudents.map(student => {
      const record = attendanceRecords.find(r => r.studentId === student.id);
      return {
        classId: selectedClassId,
        studentId: student.id,
        date: new Date(),
        status: record?.status || 'present',
        notes: null,
      };
    });

    saveAttendanceMutation.mutate(attendanceData);
  };

  const handleBulkMarkPresent = () => {
    const bulkRecords = classStudents.map(student => ({
      studentId: student.id,
      status: 'present' as const,
    }));
    setAttendanceRecords(bulkRecords);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAttendanceStatus = (studentId: string) => {
    const record = attendanceRecords.find(r => r.studentId === studentId);
    return record?.status || 'present';
  };

  // Calculate statistics
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const totalStudents = classStudents.length;
  const attendanceRate = totalStudents > 0 ? ((presentCount + lateCount) / totalStudents * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Attendance Marking */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
              <div className="flex items-center space-x-3">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-64" data-testid="select-class-attendance">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - Today {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={!selectedClassId || saveAttendanceMutation.isPending}
                  className="bg-secondary text-white hover:bg-secondary/90"
                  data-testid="button-save-attendance"
                >
                  {saveAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            {!selectedClassId ? (
              <div className="text-center py-8 text-gray-500">
                Please select a class to mark attendance
              </div>
            ) : classStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found in this class
              </div>
            ) : (
              <div className="space-y-3">
                {classStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">Roll No: {student.rollNumber}</div>
                      </div>
                    </div>
                    <RadioGroup
                      value={getAttendanceStatus(student.id)}
                      onValueChange={(value) => handleAttendanceChange(student.id, value as 'present' | 'absent' | 'late')}
                      className="flex items-center space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="present" 
                          id={`present-${student.id}`}
                          className="text-secondary border-gray-300"
                        />
                        <Label htmlFor={`present-${student.id}`} className="text-sm text-gray-700">Present</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="absent" 
                          id={`absent-${student.id}`}
                          className="text-red-600 border-gray-300"
                        />
                        <Label htmlFor={`absent-${student.id}`} className="text-sm text-gray-700">Absent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="late" 
                          id={`late-${student.id}`}
                          className="text-accent border-gray-300"
                        />
                        <Label htmlFor={`late-${student.id}`} className="text-sm text-gray-700">Late</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Statistics */}
      <div className="space-y-6">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Present</span>
                <span className="text-lg font-semibold text-secondary" data-testid="stat-present-count">
                  {presentCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Absent</span>
                <span className="text-lg font-semibold text-red-600" data-testid="stat-absent-count">
                  {absentCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Late Arrivals</span>
                <span className="text-lg font-semibold text-accent" data-testid="stat-late-count">
                  {lateCount}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Attendance Rate</span>
                  <span className="text-xl font-bold text-secondary" data-testid="stat-attendance-rate">
                    {attendanceRate}%
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
              <Button
                onClick={handleBulkMarkPresent}
                disabled={!selectedClassId}
                className="w-full bg-primary text-white hover:bg-primary/90"
                data-testid="button-mark-all-present"
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                disabled={!selectedClassId}
                className="w-full"
                data-testid="button-copy-previous"
              >
                Copy Previous Day
              </Button>
              <Button
                variant="outline"
                disabled={!selectedClassId}
                className="w-full"
                data-testid="button-export-attendance"
              >
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
