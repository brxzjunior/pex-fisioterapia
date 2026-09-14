import { prisma } from '../../shared/database/prisma.js';
import { CreateAppointmentInput, UpdateAppointmentInput } from './appointment.schema.js';
import { AppError } from '../../shared/errors/AppError.js';

export class AppointmentService {
  /**
   * Cria um novo agendamento com validação de paciente e histórico
   */
  static async create(userId: string, data: CreateAppointmentInput) {
    // Valida se o paciente existe e pertence a este profissional
    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, userId },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado.', 404, 'PATIENT_NOT_FOUND');
    }

    const scheduledDate = new Date(data.scheduledAt);

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        patientId: data.patientId,
        scheduledAt: scheduledDate,
        durationMinutes: data.durationMinutes,
        type: data.type,
        status: data.status || 'SCHEDULED',
        notes: data.notes || null,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // Registra no histórico do paciente
    await prisma.patientHistory.create({
      data: {
        patientId: patient.id,
        userId,
        actionType: 'APPOINTMENT_SCHEDULED',
        description: `Sessão de "${data.type}" agendada para ${scheduledDate.toLocaleString('pt-BR')}.`,
      },
    });

    return appointment;
  }

  /**
   * Lista atendimentos com filtros
   */
  static async list(userId: string, filters: { patientId?: string; status?: string; date?: string }) {
    const whereClause: any = { userId };

    if (filters.patientId) {
      whereClause.patientId = filters.patientId;
    }

    if (filters.status && filters.status !== 'ALL') {
      whereClause.status = filters.status;
    }

    if (filters.date) {
      const [year, month, day] = filters.date.split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

      whereClause.scheduledAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Atualiza status e/ou observações de uma sessão
   */
  static async update(userId: string, id: string, data: UpdateAppointmentInput) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, userId },
      include: { patient: true },
    });

    if (!appointment) {
      throw new AppError('Atendimento não encontrado.', 404, 'APPOINTMENT_NOT_FOUND');
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        durationMinutes: data.durationMinutes,
        type: data.type,
        status: data.status,
        notes: data.notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // Se o status mudou para finalizado, registra no histórico
    if (data.status && data.status !== appointment.status) {
      const statusLabels: Record<string, string> = {
        CONFIRMED: 'Confirmado',
        IN_PROGRESS: 'Em andamento',
        COMPLETED: 'Finalizado com sucesso',
        CANCELLED: 'Cancelado',
      };

      await prisma.patientHistory.create({
        data: {
          patientId: appointment.patientId,
          userId,
          actionType: `APPOINTMENT_${data.status}`,
          description: `Atendimento de "${updated.type}" foi marcado como: ${
            statusLabels[data.status] || data.status
          }.`,
        },
      });
    }

    return updated;
  }
}
