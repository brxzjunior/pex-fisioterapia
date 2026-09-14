import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  birthDate: z.string().optional().nullable(),
  phone: z.string().min(8, 'Telefone de contato é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')).nullable(),
  address: z.string().optional().nullable(),
  administrativeNotes: z.string().optional().nullable(),
});

export const updatePatientSchema = createPatientSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const queryPatientsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional().default('ALL'),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
