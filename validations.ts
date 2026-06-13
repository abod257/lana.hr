import { z } from "zod";

// =====================================================
// Common Validation Schemas
// =====================================================

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const phoneSchema = z
  .string()
  .regex(/^[\d+\-\s()]+$/, "Invalid phone number")
  .min(8, "Phone number is too short")
  .max(20, "Phone number is too long");

export const saudiNationalIdSchema = z
  .string()
  .regex(/^[12]\d{9}$/, "Invalid Saudi National ID");

export const saudiIBANSchema = z
  .string()
  .regex(/^SA\d{22}$/, "Invalid Saudi IBAN");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  departmentId: z.string().optional(),
  status: z.string().optional(),
});

// =====================================================
// Authentication Schemas
// =====================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: phoneSchema.optional(),
  employeeCode: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// =====================================================
// Employee Schemas
// =====================================================

export const employeeSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required"),
  firstNameAr: z.string().min(1, "First name (Arabic) is required"),
  lastNameAr: z.string().min(1, "Last name (Arabic) is required"),
  firstNameEn: z.string().min(1, "First name (English) is required"),
  lastNameEn: z.string().min(1, "Last name (English) is required"),
  email: emailSchema,
  nationalId: saudiNationalIdSchema.optional().or(z.literal("")),
  passportNumber: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).default("SINGLE"),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  phone: phoneSchema.optional().or(z.literal("")),
  personalEmail: emailSchema.optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),

  departmentId: z.string().min(1, "Department is required"),
  positionId: z.string().min(1, "Position is required"),
  managerId: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  contractType: z.enum(["PERMANENT", "TEMPORARY", "PROBATION", "CONTRACT", "PART_TIME", "INTERN"]),
  contractEndDate: z.string().optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "PROBATION", "NOTICE_PERIOD", "TERMINATED", "RESIGNED", "RETIRED"]).default("ACTIVE"),

  basicSalary: z.coerce.number().min(0),
  housingAllowance: z.coerce.number().min(0).optional(),
  transportAllowance: z.coerce.number().min(0).optional(),
  otherAllowances: z.coerce.number().min(0).optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: saudiIBANSchema.optional().or(z.literal("")),

  iqamaNumber: z.string().optional(),
  iqamaIssueDate: z.string().optional(),
  iqamaExpiryDate: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  workSchedule: z.enum(["STANDARD", "SHIFT", "FLEXIBLE"]).default("STANDARD"),
  annualLeaveBalance: z.coerce.number().int().min(0).default(21),
  sickLeaveBalance: z.coerce.number().int().min(0).default(30),
  roleId: z.string().min(1, "Role is required"),
});

export const updateEmployeeSchema = employeeSchema.partial();

// =====================================================
// Department & Position Schemas
// =====================================================

export const departmentSchema = z.object({
  code: z.string().min(1, "Code is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  nameEn: z.string().min(1, "English name is required"),
  description: z.string().optional(),
  managerId: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const positionSchema = z.object({
  code: z.string().min(1, "Code is required"),
  titleAr: z.string().min(1, "Arabic title is required"),
  titleEn: z.string().min(1, "English title is required"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  level: z.coerce.number().int().min(1).default(1),
  minSalary: z.coerce.number().min(0).optional(),
  maxSalary: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

// =====================================================
// Attendance Schemas
// =====================================================

export const attendanceSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().min(1),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE", "HOLIDAY", "WORK_FROM_HOME", "OFFICIAL_LEAVE", "SICK_LEAVE"]).default("PRESENT"),
  notes: z.string().optional(),
});

export const checkInSchema = z.object({
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const checkOutSchema = z.object({
  location: z.string().optional(),
  notes: z.string().optional(),
});

// =====================================================
// Leave Schemas
// =====================================================

export const leaveRequestSchema = z.object({
  leaveType: z.enum(["ANNUAL", "SICK", "EMERGENCY", "MATERNITY", "PATERNITY", "BEREAVEMENT", "UNPAID", "HAJJ", "MARRIAGE", "STUDY", "COMPENSATORY"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  contactDuringLeave: z.string().optional(),
  handoverNotes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const approveLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

// =====================================================
// Payroll Schemas
// =====================================================

export const salaryComponentSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(["EARNING", "DEDUCTION"]),
  category: z.enum(["BASIC", "ALLOWANCE", "BONUS", "OVERTIME", "TAX", "INSURANCE", "LOAN", "OTHER"]),
  isFixed: z.boolean().default(true),
  isTaxable: z.boolean().default(true),
  calculationType: z.enum(["FIXED", "PERCENTAGE", "FORMULA"]).default("FIXED"),
  defaultValue: z.coerce.number().min(0).optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  formula: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const payrollProcessSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Invalid period format (YYYY-MM)"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  paymentDate: z.string().optional(),
  employeeIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const loanRequestSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  reason: z.string().min(5, "Reason is required"),
  installments: z.coerce.number().int().min(1).max(60),
  startDate: z.string().min(1),
  notes: z.string().optional(),
});

export const expenseClaimSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["TRAVEL", "MEALS", "ACCOMMODATION", "OFFICE_SUPPLIES", "OTHER"]),
  amount: z.coerce.number().min(0.01),
  currency: z.string().default("SAR"),
  expenseDate: z.string().min(1),
  description: z.string().min(5),
  receiptUrls: z.array(z.string()).optional(),
});

export const overtimeRequestSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  rate: z.coerce.number().min(1).max(3).default(1.5),
  reason: z.string().min(5),
});

export const salaryCertificateRequestSchema = z.object({
  purpose: z.enum(["BANK", "EMBASSY", "LANDLORD", "GOVERNMENT", "OTHER"]),
  purposeDetails: z.string().optional(),
  language: z.enum(["AR", "EN", "BOTH"]).default("AR"),
  requiredCopies: z.coerce.number().int().min(1).max(10).default(1),
  deliveryMethod: z.enum(["EMAIL", "PICKUP", "POSTAL"]).default("EMAIL"),
  notes: z.string().optional(),
});

// =====================================================
// Document Schemas
// =====================================================

export const documentSchema = z.object({
  employeeId: z.string().min(1),
  documentType: z.enum([
    "CONTRACT", "IQAMA", "PASSPORT", "NATIONAL_ID", "CERTIFICATE",
    "DIPLOMA", "EXPERIENCE_LETTER", "BANK_LETTER", "MEDICAL_REPORT", "CV", "PHOTO", "OTHER"
  ]),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  description: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  isConfidential: z.boolean().default(false),
  fileName: z.string().min(1),
  fileSize: z.coerce.number().int().min(1),
  mimeType: z.string().min(1),
  fileUrl: z.string().min(1),
});

// =====================================================
// Recruitment Schemas
// =====================================================

export const jobOpeningSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  description: z.string().min(10),
  departmentId: z.string().min(1),
  positionId: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(["PERMANENT", "TEMPORARY", "PROBATION", "CONTRACT", "PART_TIME", "INTERN"]).default("PERMANENT"),
  experienceMin: z.coerce.number().int().min(0).default(0),
  experienceMax: z.coerce.number().int().min(0).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  currency: z.string().default("SAR"),
  skills: z.array(z.string()).default([]),
  qualifications: z.string().optional(),
  benefits: z.string().optional(),
  vacancies: z.coerce.number().int().min(1).default(1),
  status: z.enum(["DRAFT", "OPEN", "ON_HOLD", "CLOSED", "CANCELLED"]).default("DRAFT"),
  closingDate: z.string().optional(),
  hiringManagerId: z.string().optional(),
});

export const candidateSchema = z.object({
  jobOpeningId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: emailSchema,
  phone: phoneSchema.optional(),
  nationality: z.string().optional(),
  currentLocation: z.string().optional(),
  yearsOfExperience: z.coerce.number().int().min(0).optional(),
  expectedSalary: z.coerce.number().min(0).optional(),
  currency: z.string().default("SAR"),
  cvUrl: z.string().optional(),
  coverLetter: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  source: z.enum(["LINKEDIN", "REFERRAL", "WEBSITE", "AGENCY", "OTHER"]).optional(),
  referralEmployeeId: z.string().optional(),
});

export const interviewSchema = z.object({
  candidateId: z.string().min(1),
  interviewerId: z.string().min(1),
  scheduledAt: z.string().min(1),
  duration: z.coerce.number().int().min(15).max(480).default(60),
  type: z.enum(["IN_PERSON", "PHONE", "VIDEO"]).default("IN_PERSON"),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  round: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional(),
});

export const offerLetterSchema = z.object({
  candidateId: z.string().min(1),
  positionTitle: z.string().min(1),
  departmentId: z.string().min(1),
  salary: z.coerce.number().min(0),
  currency: z.string().default("SAR"),
  allowances: z.any().optional(),
  startDate: z.string().min(1),
  expiryDate: z.string().min(1),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

// =====================================================
// Notification Schemas
// =====================================================

export const notificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum([
    "LEAVE_REQUEST", "LEAVE_APPROVED", "LEAVE_REJECTED", "PAYROLL",
    "ATTENDANCE", "DOCUMENT_EXPIRY", "CONTRACT_EXPIRY", "IQAMA_EXPIRY",
    "PASSPORT_EXPIRY", "ANNOUNCEMENT", "BIRTHDAY", "PROMOTION",
    "TRANSFER", "RECRUITMENT", "GENERAL"
  ]),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  messageAr: z.string().min(1),
  messageEn: z.string().min(1),
  link: z.string().optional(),
  relatedEntity: z.string().optional(),
  relatedId: z.string().optional(),
  channels: z.array(z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"])).default(["IN_APP"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

// =====================================================
// Type Exports
// =====================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type PositionInput = z.infer<typeof positionSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type PayrollProcessInput = z.infer<typeof payrollProcessSchema>;
export type LoanRequestInput = z.infer<typeof loanRequestSchema>;
export type ExpenseClaimInput = z.infer<typeof expenseClaimSchema>;
export type OvertimeRequestInput = z.infer<typeof overtimeRequestSchema>;
export type SalaryCertificateRequestInput = z.infer<typeof salaryCertificateRequestSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type JobOpeningInput = z.infer<typeof jobOpeningSchema>;
export type CandidateInput = z.infer<typeof candidateSchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;
export type OfferLetterInput = z.infer<typeof offerLetterSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;
