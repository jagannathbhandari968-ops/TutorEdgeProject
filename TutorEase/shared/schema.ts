import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin', 'tutor', 'student', 'parent'
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  rollNumber: text("roll_number").notNull().unique(),
  grade: text("grade").notNull(),
  subjects: json("subjects").$type<string[]>().notNull().default([]),
  parentId: varchar("parent_id").references(() => users.id),
  tutorId: varchar("tutor_id").references(() => users.id),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  tutorId: varchar("tutor_id").references(() => users.id).notNull(),
  schedule: json("schedule").$type<{day: string, time: string}[]>().notNull(),
  studentIds: json("student_ids").$type<string[]>().notNull().default([]),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").references(() => classes.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'late'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fees = pgTable("fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  classId: varchar("class_id").references(() => classes.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull().default('pending'), // 'pending', 'paid', 'overdue'
  month: text("month").notNull(), // e.g., "2024-11"
  createdAt: timestamp("created_at").defaultNow(),
});

export const homework = pgTable("homework", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  classId: varchar("class_id").references(() => classes.id).notNull(),
  tutorId: varchar("tutor_id").references(() => users.id).notNull(),
  dueDate: timestamp("due_date").notNull(),
  assignedDate: timestamp("assigned_date").defaultNow(),
  status: text("status").notNull().default('active'), // 'active', 'completed', 'archived'
  totalStudents: integer("total_students").notNull().default(0),
  submittedCount: integer("submitted_count").notNull().default(0),
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeworkId: varchar("homework_id").references(() => homework.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  submissionText: text("submission_text"),
  fileUrl: text("file_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  grade: integer("grade"), // percentage
  feedback: text("feedback"),
  status: text("status").notNull().default('submitted'), // 'submitted', 'graded'
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  tutorId: varchar("tutor_id").references(() => users.id).notNull(),
  targetAudience: text("target_audience").notNull(), // 'students', 'parents', 'all'
  classIds: json("class_ids").$type<string[]>().notNull().default([]),
  isImportant: boolean("is_important").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // 'user_created', 'user_deleted', 'fee_updated', etc.
  targetType: text("target_type").notNull(), // 'user', 'student', 'class', 'fee', etc.
  targetId: varchar("target_id").notNull(),
  details: json("details").$type<Record<string, any>>().notNull().default({}),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category").notNull().default('general'),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertFeeSchema = createInsertSchema(fees).omit({
  id: true,
  createdAt: true,
});

export const insertHomeworkSchema = createInsertSchema(homework).omit({
  id: true,
  assignedDate: true,
});

export const insertHomeworkSubmissionSchema = createInsertSchema(homeworkSubmissions).omit({
  id: true,
  submittedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Homework = typeof homework.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type HomeworkSubmission = typeof homeworkSubmissions.$inferSelect;
export type InsertHomeworkSubmission = z.infer<typeof insertHomeworkSubmissionSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
