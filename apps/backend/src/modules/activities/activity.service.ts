import { prisma } from '../../shared/database/prisma.js';
import { CreateActivityInput, UpdateActivityInput } from './activity.schema.js';
import { AppError } from '../../shared/errors/AppError.js';

export class ActivityService {
  /**
   * Cria nova tarefa para o usuário profissional
   */
  static async create(userId: string, data: CreateActivityInput) {
    if (data.patientId) {
      const patient = await prisma.patient.findFirst({
        where: { id: data.patientId, userId },
      });
      if (!patient) {
        throw new AppError('Paciente relacionado não encontrado.', 404);
      }
    }

    const activity = await prisma.activity.create({
      data: {
        userId,
        patientId: data.patientId || null,
        title: data.title,
        description: data.description || null,
        category: data.category || 'Geral',
        priority: data.priority || 'MEDIUM',
        status: data.status || 'PENDING',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (data.patientId) {
      await prisma.patientHistory.create({
        data: {
          patientId: data.patientId,
          userId,
          actionType: 'ACTIVITY_CREATED',
          description: `Tarefa "${data.title}" vinculada ao paciente.`,
        },
      });
    }

    return activity;
  }

  /**
   * Lista tarefas com filtros
   */
  static async list(userId: string, filters: { status?: string; priority?: string; patientId?: string }) {
    const whereClause: any = { userId };

    if (filters.status && filters.status !== 'ALL') {
      whereClause.status = filters.status;
    }

    if (filters.priority && filters.priority !== 'ALL') {
      whereClause.priority = filters.priority;
    }

    if (filters.patientId) {
      whereClause.patientId = filters.patientId;
    }

    return prisma.activity.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Atualiza ou conclui uma tarefa
   */
  static async update(userId: string, id: string, data: UpdateActivityInput) {
    const activity = await prisma.activity.findFirst({
      where: { id, userId },
    });

    if (!activity) {
      throw new AppError('Tarefa não encontrada.', 404);
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Se vinculada a paciente e finalizada, registra no histórico
    if (activity.patientId && data.status === 'COMPLETED' && activity.status !== 'COMPLETED') {
      await prisma.patientHistory.create({
        data: {
          patientId: activity.patientId,
          userId,
          actionType: 'ACTIVITY_COMPLETED',
          description: `Tarefa concluída: "${updated.title}".`,
        },
      });
    }

    return updated;
  }

  /**
   * Remove uma tarefa
   */
  static async delete(userId: string, id: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, userId },
    });

    if (!activity) {
      throw new AppError('Tarefa não encontrada.', 404);
    }

    await prisma.activity.delete({ where: { id } });
    return { message: 'Tarefa excluída com sucesso.' };
  }
}
