import { z } from "zod";

// ─── Auth ────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["talent", "employer"]).default("talent"),
  industry: z.enum(["hair", "tattoo"]).optional(),
  shopType: z.enum(["barbershop", "salon", "tattoo_shop"]).optional(),
  licenses: z.array(z.enum(["barber", "cosmetologist", "tattoo_artist", "piercer"])).optional(),
});

// ─── Job / Listing ───────────────────────────────────

export const createJobSchema = z.object({
  businessName: z.string().min(1).max(100),
  title: z.string().min(1).max(60),
  industry: z.enum(["hair", "tattoo"]),
  specialties: z.array(z.enum(["barber", "cosmetologist", "tattoo_artist", "piercer"])).min(1, "Select at least one specialty"),
  compModel: z.enum(["hourly", "commission", "booth_rent", "hybrid"]),
  payMin: z.number().nullable().optional(),
  payMax: z.number().nullable().optional(),
  payUnit: z.string().nullable().optional(),
  payVisible: z.boolean().default(true),
  employmentType: z.enum(["w2", "c1099"]).nullable().optional(),
  schedule: z.enum(["full_time", "part_time"]).nullable().optional(),
  experienceText: z.string().max(20).nullable().optional(),
  description: z.string().max(200).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  photo: z.string().nullable().optional(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum(["active", "paused", "closed", "expired"]).optional(),
  action: z.enum(["renew"]).optional(),
});

// ─── Inquiry ─────────────────────────────────────────

export const createInquirySchema = z.object({
  jobId: z.string().min(1),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits")
    .optional()
    .or(z.literal("")),
  note: z.string().max(500).optional(),
  instagram: z
    .string()
    .regex(/^[a-zA-Z0-9._]{3,30}$/, "Invalid Instagram handle")
    .optional()
    .or(z.literal("")),
});

// ─── Profile ─────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(10).optional(),
  avatarUrl: z.string().optional(),
  portfolioPhotos: z.array(z.string()).max(6).optional(), // base64 data URLs
  shopName: z.string().max(100).optional(),
  shopAddress: z.string().max(200).optional(),
  website: z.string().max(100).optional(),
  emailNotifications: z.boolean().optional(),
});

export const switchRoleSchema = z.object({
  role: z.enum(["talent", "employer"]),
});

export const onboardingSchema = z.object({
  role: z.enum(["talent", "employer"]),
  industry: z.enum(["hair", "tattoo"]).optional(),
  specialties: z.array(z.string()).optional(),
  licenses: z.array(z.string()).optional(),
  shopType: z.string().optional(),
});

// ─── Block ───────────────────────────────────────────

export const blockUserSchema = z.object({
  blockedId: z.string().min(1),
  reason: z.string().max(200).optional(),
});

// ─── Filters ─────────────────────────────────────────

export const jobFiltersSchema = z.object({
  search: z.string().optional(),
  industry: z.string().optional(),
  specialty: z.string().optional(), // comma-separated for multi
  schedule: z.string().optional(),
  compModel: z.string().optional(),
  city: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().min(1).max(100).optional(),
  manage: z.string().optional(),
});
