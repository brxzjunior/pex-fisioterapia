import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  scheduledAt: z.string().min(1, 'Data e horário são obrigatórios'),
  durationMinutes: z.coerce.number().min(15).max(180).default(60),
  type: z.string().min(2, 'Informe o tipo de atendimento (ex: Avaliação, Pilates, Reabilitação)'),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  notes: z.string().optional().nullable(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const queryAppointmentsSchema = z.object({
  patientId: z.string().uuid().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ALL']).optional().default('ALL'),
  date: z.string().optional(), // YYYY-MM-DD
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
