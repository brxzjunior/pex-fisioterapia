import { prisma } from '../../shared/database/prisma.js';
import { CreatePatientInput, UpdatePatientInput } from './patient.schema.js';
import { AppError } from '../../shared/errors/AppError.js';

export class PatientService {
  /**
   * Cadastra um novo paciente vinculado à fisioterapeuta autenticada
   */
  static async create(userId: string, data: CreatePatientInput) {
    const patient = await prisma.patient.create({
      data: {
        userId,
        fullName: data.fullName,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        administrativeNotes: data.administrativeNotes || null,
        status: 'ACTIVE',
      },
    });

    // Registra evento automático no histórico
    await prisma.patientHistory.create({
      data: {
        patientId: patient.id,
        userId,
        actionType: 'PATIENT_CREATED',
        description: `Paciente ${patient.fullName} cadastrado no sistema.`,
      },
    });

    return patient;
  }

  /**
   * Lista os pacientes com filtros opcionais de busca e status
   */
  static async list(userId: string, filters: { search?: string; status?: 'ACTIVE' | 'INACTIVE' | 'ALL' }) {
    const whereClause: any = { userId };

    if (filters.status && filters.status !== 'ALL') {
      whereClause.status = filters.status;
    }

    if (filters.search && filters.search.trim() !== '') {
      whereClause.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    return prisma.patient.findMany({
      where: whereClause,
      orderBy: { fullName: 'asc' },
      include: {
        _count: {
          select: {
            appointments: true,
            activities: true,
          },
        },
      },
    });
  }

  /**
   * Busca um paciente por ID com seu histórico e atendimentos
   */
  static async getById(userId: string, id: string) {
    const patient = await prisma.patient.findFirst({
      where: { id, userId },
      include: {
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
      },
    });

    if (!patient) {
      throw new AppError('Paciente não encontrado.', 404, 'PATIENT_NOT_FOUND');
    }

    return patient;
  }

  /**
   * Atualiza dados de um paciente
   */
  static async update(userId: string, id: string, data: UpdatePatientInput) {
    await this.getById(userId, id); // Valida existência e permissão

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        fullName: data.fullName,
        birthDate: data.birthDate !== undefined ? (data.birthDate ? new Date(data.birthDate) : null) : undefined,
        phone: data.phone,
        email: data.email,
        address: data.address,
        administrativeNotes: data.administrativeNotes,
        status: data.status,
      },
    });

    // Registra alteração no histórico
    await prisma.patientHistory.create({
      data: {
        patientId: id,
        userId,
        actionType: 'PATIENT_UPDATED',
        description: `Dados cadastrais de ${updated.fullName} foram atualizados.`,
      },
    });

    return updated;
  }

  /**
   * Alterna status do paciente (Ativo / Inativo)
   */
  static async toggleStatus(userId: string, id: string) {
    const patient = await this.getById(userId, id);
    const newStatus = patient.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const updated = await prisma.patient.update({
      where: { id },
      data: { status: newStatus },
    });

    await prisma.patientHistory.create({
      data: {
        patientId: id,
        userId,
        actionType: 'STATUS_CHANGED',
        description: `Status do paciente alterado para ${newStatus === 'ACTIVE' ? 'Ativo' : 'Inativo'}.`,
      },
    });

    return updated;
  }
}
