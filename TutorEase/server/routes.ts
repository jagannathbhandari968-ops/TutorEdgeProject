import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertStudentSchema, insertClassSchema, 
  insertAttendanceSchema, insertFeeSchema, insertHomeworkSchema,
  insertHomeworkSubmissionSchema, insertAnnouncementSchema,
  insertSystemLogSchema, insertSystemSettingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password || user.role !== role) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Student endpoints
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const updates = req.body;
      const student = await storage.updateStudent(req.params.id, updates);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStudent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Class endpoints
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getAllClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  // Attendance endpoints
  app.get("/api/attendance/class/:classId", async (req, res) => {
    try {
      const { date } = req.query;
      const attendanceDate = date ? new Date(date as string) : new Date();
      const attendance = await storage.getAttendanceByClass(req.params.classId, attendanceDate);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance/bulk", async (req, res) => {
    try {
      const attendanceList = req.body.map((att: any) => insertAttendanceSchema.parse(att));
      const results = await storage.bulkCreateAttendance(attendanceList);
      res.status(201).json(results);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data" });
    }
  });

  // Fee endpoints
  app.get("/api/fees", async (req, res) => {
    try {
      const { month } = req.query;
      let fees;
      if (month) {
        fees = await storage.getFeesByMonth(month as string);
      } else {
        fees = await storage.getAllFees();
      }
      res.json(fees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.post("/api/fees", async (req, res) => {
    try {
      const feeData = insertFeeSchema.parse(req.body);
      const fee = await storage.createFee(feeData);
      res.status(201).json(fee);
    } catch (error) {
      res.status(400).json({ message: "Invalid fee data" });
    }
  });

  app.put("/api/fees/:id", async (req, res) => {
    try {
      const updates = req.body;
      const fee = await storage.updateFee(req.params.id, updates);
      if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
      }
      res.json(fee);
    } catch (error) {
      res.status(400).json({ message: "Failed to update fee" });
    }
  });

  // Homework endpoints
  app.get("/api/homework", async (req, res) => {
    try {
      const { tutorId, classId } = req.query;
      let homework;
      if (tutorId) {
        homework = await storage.getHomeworkByTutor(tutorId as string);
      } else if (classId) {
        homework = await storage.getHomeworkByClass(classId as string);
      } else {
        homework = await storage.getAllHomework();
      }
      res.json(homework);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  app.post("/api/homework", async (req, res) => {
    try {
      const homeworkData = insertHomeworkSchema.parse(req.body);
      const homework = await storage.createHomework(homeworkData);
      res.status(201).json(homework);
    } catch (error) {
      res.status(400).json({ message: "Invalid homework data" });
    }
  });

  app.get("/api/homework/:id/submissions", async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByHomework(req.params.id);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/homework/:id/submissions", async (req, res) => {
    try {
      const submissionData = insertHomeworkSubmissionSchema.parse({
        ...req.body,
        homeworkId: req.params.id
      });
      const submission = await storage.createHomeworkSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: "Invalid submission data" });
    }
  });

  // Announcement endpoints
  app.get("/api/announcements", async (req, res) => {
    try {
      const { tutorId } = req.query;
      let announcements;
      if (tutorId) {
        announcements = await storage.getAnnouncementsByTutor(tutorId as string);
      } else {
        announcements = await storage.getAllAnnouncements();
      }
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid announcement data" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      const classes = await storage.getAllClasses();
      const fees = await storage.getAllFees();
      
      const totalStudents = students.length;
      const classesToday = classes.length; // Simplified for demo
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyFees = fees.filter(fee => fee.month === currentMonth);
      const monthlyRevenue = monthlyFees
        .filter(fee => fee.status === 'paid')
        .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
      
      // Calculate average attendance (simplified)
      const avgAttendance = 94.2; // Mock for now
      
      res.json({
        totalStudents,
        classesToday,
        monthlyRevenue,
        avgAttendance
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin Dashboard Stats
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin dashboard stats" });
    }
  });

  // Admin User Management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const { role } = req.query;
      let users;
      if (role) {
        users = await storage.getUsersByRole(role as string);
      } else {
        users = await storage.getAllUsers();
      }
      // Remove passwords from response
      const safeUsers = users.map(user => ({ ...user, password: undefined }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Log the action
      await storage.createSystemLog({
        adminId: req.body.adminId || 'system',
        action: 'user_created',
        targetType: 'user',
        targetId: user.id,
        details: { userRole: user.role, userName: user.name },
        ipAddress: req.ip,
      });

      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/admin/users/:id/status", async (req, res) => {
    try {
      const { isActive } = req.body;
      const user = await storage.updateUserStatus(req.params.id, isActive);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the action
      await storage.createSystemLog({
        adminId: req.body.adminId || 'system',
        action: isActive ? 'user_activated' : 'user_deactivated',
        targetType: 'user',
        targetId: user.id,
        details: { userName: user.name, newStatus: isActive },
        ipAddress: req.ip,
      });

      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: "Failed to update user status" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      // Log the action
      await storage.createSystemLog({
        adminId: req.body.adminId || 'system',
        action: 'user_deleted',
        targetType: 'user',
        targetId: req.params.id,
        details: { userName: user.name, userRole: user.role },
        ipAddress: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin System Logs
  app.get("/api/admin/system-logs", async (req, res) => {
    try {
      const { adminId, action } = req.query;
      let logs;
      if (adminId) {
        logs = await storage.getSystemLogsByAdmin(adminId as string);
      } else if (action) {
        logs = await storage.getSystemLogsByAction(action as string);
      } else {
        logs = await storage.getAllSystemLogs();
      }
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system logs" });
    }
  });

  app.post("/api/admin/system-logs", async (req, res) => {
    try {
      const logData = insertSystemLogSchema.parse(req.body);
      const log = await storage.createSystemLog(logData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid log data" });
    }
  });

  // Admin System Settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const { category } = req.query;
      let settings;
      if (category) {
        settings = await storage.getSystemSettingsByCategory(category as string);
      } else {
        settings = await storage.getAllSystemSettings();
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const settingData = insertSystemSettingSchema.parse(req.body);
      const setting = await storage.createSystemSetting(settingData);
      
      // Log the action
      await storage.createSystemLog({
        adminId: req.body.adminId || 'system',
        action: 'setting_created',
        targetType: 'setting',
        targetId: setting.id,
        details: { key: setting.key, category: setting.category },
        ipAddress: req.ip,
      });

      res.status(201).json(setting);
    } catch (error) {
      res.status(400).json({ message: "Invalid setting data" });
    }
  });

  app.put("/api/admin/settings/:id", async (req, res) => {
    try {
      const updates = req.body;
      const setting = await storage.updateSystemSetting(req.params.id, updates);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      // Log the action
      await storage.createSystemLog({
        adminId: req.body.adminId || 'system',
        action: 'setting_updated',
        targetType: 'setting',
        targetId: setting.id,
        details: { key: setting.key, newValue: setting.value },
        ipAddress: req.ip,
      });

      res.json(setting);
    } catch (error) {
      res.status(400).json({ message: "Failed to update setting" });
    }
  });

  // Admin Reports
  app.get("/api/admin/reports/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const report = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        inactiveUsers: users.filter(u => !u.isActive).length,
        byRole: {
          admin: users.filter(u => u.role === 'admin').length,
          tutor: users.filter(u => u.role === 'tutor').length,
          student: users.filter(u => u.role === 'student').length,
          parent: users.filter(u => u.role === 'parent').length,
        },
        recentRegistrations: users
          .filter(u => new Date(u.createdAt!).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000)
          .length
      };
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate user report" });
    }
  });

  app.get("/api/admin/reports/financial", async (req, res) => {
    try {
      const fees = await storage.getAllFees();
      const totalRevenue = fees
        .filter(fee => fee.status === 'paid')
        .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
      
      const pendingAmount = fees
        .filter(fee => fee.status === 'pending')
        .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
      
      const overdueAmount = fees
        .filter(fee => fee.status === 'overdue')
        .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);

      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = fees
        .filter(fee => fee.status === 'paid' && fee.month === currentMonth)
        .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);

      res.json({
        totalRevenue,
        monthlyRevenue,
        pendingAmount,
        overdueAmount,
        totalFees: fees.length,
        paidFees: fees.filter(fee => fee.status === 'paid').length,
        pendingFees: fees.filter(fee => fee.status === 'pending').length,
        overdueFees: fees.filter(fee => fee.status === 'overdue').length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate financial report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
