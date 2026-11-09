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

  /**
   * Remove permanentemente um atendimento
   */
  static async delete(userId: string, id: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, userId },
    });

    if (!appointment) {
      throw new AppError('Atendimento não encontrado.', 404, 'APPOINTMENT_NOT_FOUND');
    }

    await prisma.appointment.delete({
      where: { id },
    });

    await prisma.patientHistory.create({
      data: {
        patientId: appointment.patientId,
        userId,
        actionType: 'APPOINTMENT_CANCELLED',
        description: `Agendamento de "${appointment.type}" foi excluído da agenda.`,
      },
    });

    return { message: 'Atendimento removido com sucesso.' };
  }

  /**
   * Registra envio de lembrete WhatsApp no histórico do paciente
   */
  static async registerReminder(userId: string, id: string, messagePreview?: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, userId },
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

    if (!appointment) {
      throw new AppError('Atendimento não encontrado.', 404, 'APPOINTMENT_NOT_FOUND');
    }

    const scheduledDate = new Date(appointment.scheduledAt);
    const dateFormatted = scheduledDate.toLocaleDateString('pt-BR');
    const timeFormatted = scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    await prisma.patientHistory.create({
      data: {
        patientId: appointment.patientId,
        userId,
        actionType: 'WHATSAPP_REMINDER_SENT',
        description: `Lembrete via WhatsApp gerado para sessão de "${appointment.type}" (${dateFormatted} às ${timeFormatted}).`,
      },
    });

    return {
      success: true,
      appointment,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Processa disparos de lembretes automáticos para as próximas 24 horas
   */
  static async broadcastUpcomingReminders(userId: string) {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        userId,
        scheduledAt: {
          gte: now,
          lte: next24h,
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
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
      orderBy: { scheduledAt: 'asc' },
    });

    const results = [];
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

    for (const app of upcomingAppointments) {
      const scheduledDate = new Date(app.scheduledAt);
      const dateFormatted = scheduledDate.toLocaleDateString('pt-BR');
      const timeFormatted = scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const cleanPhone = app.patient.phone.replace(/\D/g, '');

      const message = `Olá, ${app.patient.fullName}! Lembramos da sua sessão de ${app.type} amanhã, ${dateFormatted} às ${timeFormatted}, na FisioPro. Por favor, responda 1 para confirmar ou 2 se precisar remarcar.`;

      let webhookDispatched = false;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: app.id,
              phone: cleanPhone,
              patientName: app.patient.fullName,
              message,
              scheduledAt: app.scheduledAt,
            }),
          });
          webhookDispatched = true;
        } catch {
          webhookDispatched = false;
        }
      }

      await prisma.patientHistory.create({
        data: {
          patientId: app.patientId,
          userId,
          actionType: 'WHATSAPP_REMINDER_SENT',
          description: `Disparo automático de lembrete prévio para sessão (${dateFormatted} às ${timeFormatted})${webhookDispatched ? ' via Webhook Oficial' : ' via WhatsApp'}.`,
        },
      });

      results.push({
        appointmentId: app.id,
        patientName: app.patient.fullName,
        phone: app.patient.phone,
        scheduledAt: app.scheduledAt,
        message,
        webhookDispatched,
      });
    }

    return {
      totalFound: upcomingAppointments.length,
      processed: results.length,
      reminders: results,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Processa Webhook receptivo do WhatsApp para confirmações automáticas
   */
  static async handleWebhookNotification(payload: {
    appointmentId?: string;
    phone?: string;
    action?: 'CONFIRM' | 'CANCEL' | 'RESCHEDULE';
    responseMessage?: string;
  }) {
    if (!payload.appointmentId && !payload.phone) {
      throw new AppError('Identificador ou telefone de consulta obrigatório.', 400);
    }

    let appointment = null;
    if (payload.appointmentId) {
      appointment = await prisma.appointment.findUnique({
        where: { id: payload.appointmentId },
        include: { patient: true },
      });
    } else if (payload.phone) {
      const clean = payload.phone.replace(/\D/g, '');
      const patient = await prisma.patient.findFirst({
        where: { phone: { contains: clean.slice(-8) } },
      });
      if (patient) {
        appointment = await prisma.appointment.findFirst({
          where: {
            patientId: patient.id,
            scheduledAt: { gte: new Date() },
            status: 'SCHEDULED',
          },
          include: { patient: true },
          orderBy: { scheduledAt: 'asc' },
        });
      }
    }

    if (!appointment) {
      return { handled: false, message: 'Nenhum agendamento ativo encontrado para a notificação.' };
    }

    const action = payload.action ||
      (payload.responseMessage?.match(/1|sim|confirma/i) ? 'CONFIRM' :
       payload.responseMessage?.match(/2|não|nao|cancela/i) ? 'CANCEL' : null);

    if (action === 'CONFIRM') {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CONFIRMED' },
      });
      await prisma.patientHistory.create({
        data: {
          patientId: appointment.patientId,
          userId: appointment.userId,
          actionType: 'APPOINTMENT_CONFIRMED',
          description: `Sessão confirmada automaticamente via resposta no WhatsApp Webhook.`,
        },
      });
      return { handled: true, status: 'CONFIRMED', appointmentId: appointment.id };
    } else if (action === 'CANCEL') {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CANCELLED' },
      });
      await prisma.patientHistory.create({
        data: {
          patientId: appointment.patientId,
          userId: appointment.userId,
          actionType: 'APPOINTMENT_CANCELLED',
          description: `Sessão cancelada via resposta do paciente no WhatsApp Webhook.`,
        },
      });
      return { handled: true, status: 'CANCELLED', appointmentId: appointment.id };
    }

    return { handled: false, message: 'Ação não reconhecida no webhook.', raw: payload };
  }
}

