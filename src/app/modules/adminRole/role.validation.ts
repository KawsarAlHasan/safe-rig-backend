import { z } from "zod";

// Enum matching AccessibleModule
const accessibleModuleEnum = z.enum([
  "dashboard",
  "client_management",
  "administrators",
  "game_management",
  "content_management",
  "annotation",
  "subscription_plan",
  "promo_code",
  "client_view",
]);

// Schema for a single permission object
const permissionSchema = z.object({
  accessibleModule: accessibleModuleEnum,
  view: z.boolean().optional().default(false),
  create: z.boolean().optional().default(false),
  edit: z.boolean().optional().default(false),
  delete: z.boolean().optional().default(false),
  statusChange: z.boolean().optional().default(false),
  selectTodayGame: z.boolean().optional().default(false),
  approve: z.boolean().optional().default(false),
  clientView: z.boolean().optional().default(false),
});

// Schema for creating an AdminRole with permissions
export const createAdminRoleZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name is required"),
    permissions: z
      .array(permissionSchema)
      .nonempty("At least one permission is required"),
  }),
});

// Schema for updating an AdminRole with permissions
export const updateAdminRoleZodSchema = z.object({
  body: z.object({
    id: z.number("Id is required"),
    name: z.string().min(3, "Name is required"),
    permissions: z
      .array(permissionSchema)
      .nonempty("At least one permission is required"),
  }),
});
