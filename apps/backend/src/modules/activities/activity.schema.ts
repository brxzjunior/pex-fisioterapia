import { z } from 'zod';

export const createActivitySchema = z.object({
  patientId: z.string().uuid().optional().nullable(),
  title: z.string().min(3, 'O título da tarefa deve ter no mínimo 3 caracteres'),
  description: z.string().optional().nullable(),
  category: z.string().default('Geral'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  dueDate: z.string().optional().nullable(),
});

export const updateActivitySchema = createActivitySchema.partial();

export const queryActivitiesSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ALL']).optional().default('ALL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ALL']).optional().default('ALL'),
  patientId: z.string().uuid().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
