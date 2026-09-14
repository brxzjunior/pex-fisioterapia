import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco de dados com dados de teste acadêmico...');

  // 1. Cria ou atualiza a fisioterapeuta padrão
  const user = await prisma.user.upsert({
    where: { email: 'fisioterapeuta@exemplo.com' },
    update: {},
    create: {
      email: 'fisioterapeuta@exemplo.com',
      name: 'Dra. Camila Vasconcelos',
      phone: '(11) 98765-4321',
      professionalBio:
        'Fisioterapeuta graduada com foco em Reabilitação Ortopédica, Pilates Clínico e Fisioterapia Desportiva. Atendimento humanizado e individualizado.',
      specialties: 'Ortopedia Funcional, Pilates Clínico, Reabilitação Desportiva, Terapia Manual',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Fisioterapeuta configurada: ${user.name}`);

  // 2. Cria pacientes de demonstração
  const patient1 = await prisma.patient.create({
    data: {
      userId: user.id,
      fullName: 'Mariana Duarte Silva',
      phone: '(11) 91234-5678',
      email: 'mariana.silva@email.com',
      address: 'Rua Bela Cintra, 450 - Consolação, SP',
      status: 'ACTIVE',
      administrativeNotes: 'Preferência por horários matutinos. Encaminhada por ortopedista para lombalgia.',
      birthDate: new Date('1992-05-14'),
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      userId: user.id,
      fullName: 'Lucas Gabriel Albuquerque',
      phone: '(11) 99876-5432',
      email: 'lucas.albuquerque@email.com',
      address: 'Av. Paulista, 1200 - Bela Vista, SP',
      status: 'ACTIVE',
      administrativeNotes: 'Atleta amador de corrida de rua. Reabilitação de ligamento cruzado anterior.',
      birthDate: new Date('1988-11-20'),
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      userId: user.id,
      fullName: 'Carlos Eduardo Mendes',
      phone: '(11) 97654-3210',
      email: 'carlos.mendes@email.com',
      address: 'Rua Augusta, 890 - Jardins, SP',
      status: 'INACTIVE',
      administrativeNotes: 'Tratamento de ombro congelado finalizado com alta clínica.',
      birthDate: new Date('1975-03-08'),
    },
  });

  console.log('✅ 3 Pacientes fictícios cadastrados.');

  // 3. Cria atendimentos
  const now = new Date();
  const todayAt14 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0);
  const todayAt16 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
  const tomorrowAt10 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        userId: user.id,
        patientId: patient1.id,
        scheduledAt: todayAt14,
        durationMinutes: 60,
        type: 'Pilates Clínico e Postura',
        status: 'CONFIRMED',
        notes: 'Sessão com ênfase em fortalecimento de paravertebrais.',
      },
      {
        userId: user.id,
        patientId: patient2.id,
        scheduledAt: todayAt16,
        durationMinutes: 60,
        type: 'Fisioterapia Desportiva',
        status: 'SCHEDULED',
        notes: 'Avaliação de mobilidade e treino proprioceptivo de joelho.',
      },
      {
        userId: user.id,
        patientId: patient1.id,
        scheduledAt: tomorrowAt10,
        durationMinutes: 60,
        type: 'Reabilitação Ortopédica',
        status: 'SCHEDULED',
        notes: 'Sessão de manutenção.',
      },
    ],
  });

  console.log('✅ Atendimentos agendados cadastrados.');

  // 4. Cria atividades gerenciais
  await prisma.activity.createMany({
    data: [
      {
        userId: user.id,
        patientId: patient1.id,
        title: 'Enviar protocolo de exercícios domiciliares para Mariana',
        description: 'Alongamentos suaves para coluna e respiração diafragmática.',
        category: 'Acompanhamento',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: todayAt14,
      },
      {
        userId: user.id,
        patientId: patient2.id,
        title: 'Confirmar horário da sessão desportiva de Lucas',
        description: 'Lembrar de trazer tênis esportivo adequado.',
        category: 'Contato',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: todayAt16,
      },
      {
        userId: user.id,
        title: 'Organizar estoques de faixas elásticas e halteres',
        description: 'Conferir integridade do material de cinesioterapia.',
        category: 'Material',
        priority: 'LOW',
        status: 'COMPLETED',
      },
    ],
  });

  console.log('✅ Atividades e tarefas cadastradas.');

  // 5. Trilha de Histórico de Auditoria
  await prisma.patientHistory.createMany({
    data: [
      {
        userId: user.id,
        patientId: patient1.id,
        actionType: 'PATIENT_CREATED',
        description: 'Paciente Mariana Duarte Silva cadastrada no sistema.',
      },
      {
        userId: user.id,
        patientId: patient1.id,
        actionType: 'APPOINTMENT_SCHEDULED',
        description: 'Sessão de Pilates Clínico agendada para hoje às 14:30.',
      },
      {
        userId: user.id,
        patientId: patient2.id,
        actionType: 'PATIENT_CREATED',
        description: 'Paciente Lucas Gabriel Albuquerque cadastrado no sistema.',
      },
      {
        userId: user.id,
        patientId: patient3.id,
        actionType: 'STATUS_CHANGED',
        description: 'Status do paciente alterado para Inativo após alta clínica.',
      },
    ],
  });

  console.log('✅ Histórico de auditoria populado.');
  console.log('🎉 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
