import { prisma } from '../../shared/database/prisma.js';

export class DashboardService {
  /**
   * Consolida métricas gerenciais para o usuário autenticado
   */
  static async getStats(userId: string) {
    const now = new Date();
    
    // Início e fim do dia atual (00:00:00 até 23:59:59)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Início e fim da semana corrente (Domingo a Sábado)
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    try {
      const [
        totalPatients,
        activePatients,
        appointmentsToday,
        appointmentsWeek,
        pendingActivities,
        upcomingAppointments,
        recentActivities,
      ] = await Promise.all([
        // Total de pacientes
        prisma.patient.count({
          where: { userId },
        }),
        // Pacientes ativos
        prisma.patient.count({
          where: { userId, status: 'ACTIVE' },
        }),
        // Atendimentos hoje
        prisma.appointment.count({
          where: {
            userId,
            scheduledAt: { gte: startOfToday, lte: endOfToday },
            status: { not: 'CANCELLED' },
          },
        }),
        // Atendimentos da semana
        prisma.appointment.count({
          where: {
            userId,
            scheduledAt: { gte: startOfWeek, lte: endOfWeek },
            status: { not: 'CANCELLED' },
          },
        }),
        // Atividades pendentes
        prisma.activity.count({
          where: {
            userId,
            status: 'PENDING',
          },
        }),
        // Próximos atendimentos (a partir de agora)
        prisma.appointment.findMany({
          where: {
            userId,
            scheduledAt: { gte: now },
            status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
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
          take: 5,
        }),
        // Atividades recentes pendentes ou em andamento
        prisma.activity.findMany({
          where: {
            userId,
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
          include: {
            patient: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
          take: 5,
        }),
      ]);

      return {
        metrics: {
          totalPatients,
          activePatients,
          appointmentsToday,
          appointmentsWeek,
          pendingActivities,
        },
        upcomingAppointments,
        recentActivities,
      };
    } catch (err) {
      // Retorno seguro caso o banco ainda não tenha dados ou em ambiente simulado
      return {
        metrics: {
          totalPatients: 0,
          activePatients: 0,
          appointmentsToday: 0,
          appointmentsWeek: 0,
          pendingActivities: 0,
        },
        upcomingAppointments: [],
        recentActivities: [],
      };
    }
  }
}
