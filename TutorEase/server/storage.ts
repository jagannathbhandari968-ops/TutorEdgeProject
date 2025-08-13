import { 
  type User, type InsertUser, type Student, type InsertStudent, 
  type Class, type InsertClass, type Attendance, type InsertAttendance,
  type Fee, type InsertFee, type Homework, type InsertHomework,
  type HomeworkSubmission, type InsertHomeworkSubmission,
  type Announcement, type InsertAnnouncement, type SystemLog,
  type InsertSystemLog, type SystemSetting, type InsertSystemSetting
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudentsByTutor(tutorId: string): Promise<Student[]>;
  getStudentsByParent(parentId: string): Promise<Student[]>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;

  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getClassesByTutor(tutorId: string): Promise<Class[]>;
  getClassesByStudent(studentId: string): Promise<Class[]>;
  getAllClasses(): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;

  // Attendance
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByClass(classId: string, date?: Date): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  bulkCreateAttendance(attendanceList: InsertAttendance[]): Promise<Attendance[]>;

  // Fees
  getFee(id: string): Promise<Fee | undefined>;
  getFeesByStudent(studentId: string): Promise<Fee[]>;
  getFeesByClass(classId: string): Promise<Fee[]>;
  getFeesByMonth(month: string): Promise<Fee[]>;
  getAllFees(): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  updateFee(id: string, fee: Partial<InsertFee>): Promise<Fee | undefined>;
  deleteFee(id: string): Promise<boolean>;

  // Homework
  getHomework(id: string): Promise<Homework | undefined>;
  getHomeworkByClass(classId: string): Promise<Homework[]>;
  getHomeworkByTutor(tutorId: string): Promise<Homework[]>;
  getAllHomework(): Promise<Homework[]>;
  createHomework(homework: InsertHomework): Promise<Homework>;
  updateHomework(id: string, homework: Partial<InsertHomework>): Promise<Homework | undefined>;
  deleteHomework(id: string): Promise<boolean>;

  // Homework Submissions
  getHomeworkSubmission(id: string): Promise<HomeworkSubmission | undefined>;
  getSubmissionsByHomework(homeworkId: string): Promise<HomeworkSubmission[]>;
  getSubmissionsByStudent(studentId: string): Promise<HomeworkSubmission[]>;
  createHomeworkSubmission(submission: InsertHomeworkSubmission): Promise<HomeworkSubmission>;
  updateHomeworkSubmission(id: string, submission: Partial<InsertHomeworkSubmission>): Promise<HomeworkSubmission | undefined>;

  // Announcements
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  getAnnouncementsByTutor(tutorId: string): Promise<Announcement[]>;
  getAnnouncementsForClasses(classIds: string[]): Promise<Announcement[]>;
  getAllAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;

  // Admin-specific methods
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserStatus(id: string, isActive: boolean): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  createUser(user: InsertUser): Promise<User>;
  
  // System Logs
  getSystemLog(id: string): Promise<SystemLog | undefined>;
  getSystemLogsByAdmin(adminId: string): Promise<SystemLog[]>;
  getSystemLogsByAction(action: string): Promise<SystemLog[]>;
  getAllSystemLogs(): Promise<SystemLog[]>;
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  
  // System Settings
  getSystemSetting(id: string): Promise<SystemSetting | undefined>;
  getSystemSettingByKey(key: string): Promise<SystemSetting | undefined>;
  getSystemSettingsByCategory(category: string): Promise<SystemSetting[]>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
  createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(id: string, setting: Partial<InsertSystemSetting>): Promise<SystemSetting | undefined>;
  deleteSystemSetting(id: string): Promise<boolean>;
  
  // Admin Dashboard Stats
  getAdminDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalStudents: number;
    totalTutors: number;
    totalParents: number;
    totalClasses: number;
    totalRevenue: number;
    monthlyRevenue: number;
    avgAttendance: number;
  }>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private students = new Map<string, Student>();
  private classes = new Map<string, Class>();
  private attendance = new Map<string, Attendance>();
  private fees = new Map<string, Fee>();
  private homework = new Map<string, Homework>();
  private homeworkSubmissions = new Map<string, HomeworkSubmission>();
  private announcements = new Map<string, Announcement>();
  private systemLogs = new Map<string, SystemLog>();
  private systemSettings = new Map<string, SystemSetting>();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      email: "admin@edumanage.com",
      password: "admin123",
      name: "System Administrator",
      role: "admin",
      avatar: null,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create default tutor user
    const tutorId = randomUUID();
    const tutor: User = {
      id: tutorId,
      email: "tutor@edumanage.com",
      password: "password123",
      name: "Sarah Johnson",
      role: "tutor",
      avatar: null,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    };
    this.users.set(tutorId, tutor);

    // Create sample students
    const student1Id = randomUUID();
    const student1: Student = {
      id: student1Id,
      name: "Alex Chen",
      email: "alex.chen@email.com",
      rollNumber: "101",
      grade: "Grade 10",
      subjects: ["Mathematics"],
      parentId: null,
      tutorId: tutorId,
      avatar: null,
      createdAt: new Date(),
    };
    this.students.set(student1Id, student1);

    const student2Id = randomUUID();
    const student2: Student = {
      id: student2Id,
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      rollNumber: "102",
      grade: "Grade 11",
      subjects: ["Physics"],
      parentId: null,
      tutorId: tutorId,
      avatar: null,
      createdAt: new Date(),
    };
    this.students.set(student2Id, student2);

    // Create sample class
    const classId = randomUUID();
    const mathClass: Class = {
      id: classId,
      name: "Mathematics Grade 10",
      subject: "Mathematics",
      grade: "Grade 10",
      tutorId: tutorId,
      schedule: [{ day: "Monday", time: "2:00 PM" }, { day: "Wednesday", time: "2:00 PM" }],
      studentIds: [student1Id],
      feeAmount: "250.00",
      createdAt: new Date(),
    };
    this.classes.set(classId, mathClass);

    // Create sample fee
    const feeId = randomUUID();
    const fee: Fee = {
      id: feeId,
      studentId: student1Id,
      classId: classId,
      amount: "250.00",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      paidDate: new Date(),
      status: "paid",
      month: "2024-11",
      createdAt: new Date(),
    };
    this.fees.set(feeId, fee);

    // Create sample homework
    const homeworkId = randomUUID();
    const homeworkAssignment: Homework = {
      id: homeworkId,
      title: "Chapter 5: Quadratic Equations",
      description: "Complete exercises 5.1 to 5.5 from the textbook. Show all working steps clearly.",
      classId: classId,
      tutorId: tutorId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedDate: new Date(),
      status: "active",
      totalStudents: 1,
      submittedCount: 0,
    };
    this.homework.set(homeworkId, homeworkAssignment);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }

  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentsByTutor(tutorId: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(student => student.tutorId === tutorId);
  }

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(student => student.parentId === parentId);
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const newStudent: Student = { ...student, id, createdAt: new Date() };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...student };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  // Classes
  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClassesByTutor(tutorId: string): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(cls => cls.tutorId === tutorId);
  }

  async getClassesByStudent(studentId: string): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(cls => 
      cls.studentIds.includes(studentId)
    );
  }

  async getAllClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = randomUUID();
    const newClass: Class = { ...classData, id, createdAt: new Date() };
    this.classes.set(id, newClass);
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const existing = this.classes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...classData };
    this.classes.set(id, updated);
    return updated;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Attendance
  async getAttendance(id: string): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async getAttendanceByClass(classId: string, date?: Date): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(att => {
      const classMatch = att.classId === classId;
      if (!date) return classMatch;
      const dateMatch = att.date.toDateString() === date.toDateString();
      return classMatch && dateMatch;
    });
  }

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(att => att.studentId === studentId);
  }

  async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const newAttendance: Attendance = { ...attendance, id, createdAt: new Date() };
    this.attendance.set(id, newAttendance);
    return newAttendance;
  }

  async updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const existing = this.attendance.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...attendance };
    this.attendance.set(id, updated);
    return updated;
  }

  async bulkCreateAttendance(attendanceList: InsertAttendance[]): Promise<Attendance[]> {
    const results: Attendance[] = [];
    for (const att of attendanceList) {
      const created = await this.createAttendance(att);
      results.push(created);
    }
    return results;
  }

  // Fees
  async getFee(id: string): Promise<Fee | undefined> {
    return this.fees.get(id);
  }

  async getFeesByStudent(studentId: string): Promise<Fee[]> {
    return Array.from(this.fees.values()).filter(fee => fee.studentId === studentId);
  }

  async getFeesByClass(classId: string): Promise<Fee[]> {
    return Array.from(this.fees.values()).filter(fee => fee.classId === classId);
  }

  async getFeesByMonth(month: string): Promise<Fee[]> {
    return Array.from(this.fees.values()).filter(fee => fee.month === month);
  }

  async getAllFees(): Promise<Fee[]> {
    return Array.from(this.fees.values());
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const id = randomUUID();
    const newFee: Fee = { ...fee, id, createdAt: new Date() };
    this.fees.set(id, newFee);
    return newFee;
  }

  async updateFee(id: string, fee: Partial<InsertFee>): Promise<Fee | undefined> {
    const existing = this.fees.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...fee };
    this.fees.set(id, updated);
    return updated;
  }

  async deleteFee(id: string): Promise<boolean> {
    return this.fees.delete(id);
  }

  // Homework
  async getHomework(id: string): Promise<Homework | undefined> {
    return this.homework.get(id);
  }

  async getHomeworkByClass(classId: string): Promise<Homework[]> {
    return Array.from(this.homework.values()).filter(hw => hw.classId === classId);
  }

  async getHomeworkByTutor(tutorId: string): Promise<Homework[]> {
    return Array.from(this.homework.values()).filter(hw => hw.tutorId === tutorId);
  }

  async getAllHomework(): Promise<Homework[]> {
    return Array.from(this.homework.values());
  }

  async createHomework(homework: InsertHomework): Promise<Homework> {
    const id = randomUUID();
    const newHomework: Homework = { ...homework, id, assignedDate: new Date() };
    this.homework.set(id, newHomework);
    return newHomework;
  }

  async updateHomework(id: string, homework: Partial<InsertHomework>): Promise<Homework | undefined> {
    const existing = this.homework.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...homework };
    this.homework.set(id, updated);
    return updated;
  }

  async deleteHomework(id: string): Promise<boolean> {
    return this.homework.delete(id);
  }

  // Homework Submissions
  async getHomeworkSubmission(id: string): Promise<HomeworkSubmission | undefined> {
    return this.homeworkSubmissions.get(id);
  }

  async getSubmissionsByHomework(homeworkId: string): Promise<HomeworkSubmission[]> {
    return Array.from(this.homeworkSubmissions.values()).filter(sub => sub.homeworkId === homeworkId);
  }

  async getSubmissionsByStudent(studentId: string): Promise<HomeworkSubmission[]> {
    return Array.from(this.homeworkSubmissions.values()).filter(sub => sub.studentId === studentId);
  }

  async createHomeworkSubmission(submission: InsertHomeworkSubmission): Promise<HomeworkSubmission> {
    const id = randomUUID();
    const newSubmission: HomeworkSubmission = { ...submission, id, submittedAt: new Date() };
    this.homeworkSubmissions.set(id, newSubmission);
    return newSubmission;
  }

  async updateHomeworkSubmission(id: string, submission: Partial<InsertHomeworkSubmission>): Promise<HomeworkSubmission | undefined> {
    const existing = this.homeworkSubmissions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...submission };
    this.homeworkSubmissions.set(id, updated);
    return updated;
  }

  // Announcements
  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async getAnnouncementsByTutor(tutorId: string): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).filter(ann => ann.tutorId === tutorId);
  }

  async getAnnouncementsForClasses(classIds: string[]): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).filter(ann => 
      ann.classIds.some(id => classIds.includes(id))
    );
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const newAnnouncement: Announcement = { ...announcement, id, createdAt: new Date() };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const existing = this.announcements.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...announcement };
    this.announcements.set(id, updated);
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcements.delete(id);
  }

  // Admin-specific methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, isActive };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { 
      ...user, 
      id, 
      isActive: true, 
      lastLogin: null,
      createdAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // System Logs
  async getSystemLog(id: string): Promise<SystemLog | undefined> {
    return this.systemLogs.get(id);
  }

  async getSystemLogsByAdmin(adminId: string): Promise<SystemLog[]> {
    return Array.from(this.systemLogs.values()).filter(log => log.adminId === adminId);
  }

  async getSystemLogsByAction(action: string): Promise<SystemLog[]> {
    return Array.from(this.systemLogs.values()).filter(log => log.action === action);
  }

  async getAllSystemLogs(): Promise<SystemLog[]> {
    return Array.from(this.systemLogs.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const id = randomUUID();
    const newLog: SystemLog = { ...log, id, createdAt: new Date() };
    this.systemLogs.set(id, newLog);
    return newLog;
  }

  // System Settings
  async getSystemSetting(id: string): Promise<SystemSetting | undefined> {
    return this.systemSettings.get(id);
  }

  async getSystemSettingByKey(key: string): Promise<SystemSetting | undefined> {
    return Array.from(this.systemSettings.values()).find(setting => setting.key === key);
  }

  async getSystemSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values()).filter(setting => setting.category === category);
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values());
  }

  async createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const id = randomUUID();
    const newSetting: SystemSetting = { ...setting, id, updatedAt: new Date() };
    this.systemSettings.set(id, newSetting);
    return newSetting;
  }

  async updateSystemSetting(id: string, setting: Partial<InsertSystemSetting>): Promise<SystemSetting | undefined> {
    const existing = this.systemSettings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...setting, updatedAt: new Date() };
    this.systemSettings.set(id, updated);
    return updated;
  }

  async deleteSystemSetting(id: string): Promise<boolean> {
    return this.systemSettings.delete(id);
  }

  // Admin Dashboard Stats
  async getAdminDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalStudents: number;
    totalTutors: number;
    totalParents: number;
    totalClasses: number;
    totalRevenue: number;
    monthlyRevenue: number;
    avgAttendance: number;
  }> {
    const users = Array.from(this.users.values());
    const students = Array.from(this.students.values());
    const classes = Array.from(this.classes.values());
    const fees = Array.from(this.fees.values());
    
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const totalStudents = students.length;
    const totalTutors = users.filter(user => user.role === 'tutor').length;
    const totalParents = users.filter(user => user.role === 'parent').length;
    const totalClasses = classes.length;
    
    const totalRevenue = fees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = fees
      .filter(fee => fee.status === 'paid' && fee.month === currentMonth)
      .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    
    // Calculate average attendance
    const attendance = Array.from(this.attendance.values());
    const totalAttendanceRecords = attendance.length;
    const presentRecords = attendance.filter(att => att.status === 'present' || att.status === 'late').length;
    const avgAttendance = totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords * 100) : 0;
    
    return {
      totalUsers,
      activeUsers,
      totalStudents,
      totalTutors,
      totalParents,
      totalClasses,
      totalRevenue,
      monthlyRevenue,
      avgAttendance: parseFloat(avgAttendance.toFixed(1))
    };
  }
}

export const storage = new MemStorage();
