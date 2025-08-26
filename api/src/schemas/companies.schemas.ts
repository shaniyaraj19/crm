import { z } from "zod";


export const addressSchema = z.object({
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export type Address = z.infer<typeof addressSchema>;


export const createCompanySchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, "Company name is required")
      .max(200, "Company name cannot exceed 200 characters")
      .trim(),
    description: z.string().max(2000).trim().optional(),
    industry: z.string().max(100).trim().optional(),
    website: z.string().url().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    phone: z.string().trim().optional(),
    fax: z.string().trim().optional(),

    employeeCount: z.number().min(0).optional(),
    annualRevenue: z.number().min(0).optional(),
    currency: z.string().length(3).toUpperCase().default("USD"),
    foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
    companyType: z.enum([
      "Public",
      "Private",
      "Non-profit",
      "Government",
      "Partnership",
      "Sole Proprietorship",
    ]).optional(),

    // ✅ Reuse Address schema
    address: addressSchema.optional(),
    billingAddress: addressSchema.optional(),

    linkedinUrl: z.string().trim().optional(),
    twitterHandle: z.string().trim().optional(),
    facebookUrl: z.string().trim().optional(),

    leadSource: z.string().trim().optional(),
    leadScore: z.number().min(0).max(100).optional(),
    leadStatus: z.string().trim().optional(),

    parentCompanyId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent company ID format")
      .optional(),

    customFields: z.record(z.any()).optional(),
    tags: z.array(z.string().trim()).optional(),
    labels: z.array(z.string().trim()).optional(),

    status: z
      .enum(["Active", "Inactive", "Prospect", "Customer", "Partner"])
      .default("Prospect"),
    lifecycle: z
      .enum(["Lead", "Prospect", "Customer", "Partner", "Former Customer"])
      .default("Lead"),

    nextFollowUpAt: z.string().datetime().transform((str) => new Date(str)).optional(),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>["body"];


export const updateCompanySchema = z.object({
  body: createCompanySchema.shape.body.partial(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>["body"];
