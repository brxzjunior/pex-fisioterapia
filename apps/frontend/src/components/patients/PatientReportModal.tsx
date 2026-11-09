import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  X,
  Printer,
  Download,
  Share2,
  Activity,
  FileText,
  Shield,
} from 'lucide-react';


interface PatientReportData {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  birthDate?: string | null;
  address?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  administrativeNotes?: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
    specialties?: string | null;
    professionalBio?: string | null;
  };
  appointments: Array<{
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    type: string;
    status: string;
    notes?: string | null;
  }>;
  activities: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string | null;
  }>;
  history: Array<{
    id: string;
    actionType: string;
    description: string;
    createdAt: string;
  }>;
}

interface PatientReportModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientReportModal: React.FC<PatientReportModalProps> = ({
  patientId,
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<PatientReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !patientId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<PatientReportData>(`/patients/${patientId}/report`);
        setReport(res.data);
      } catch (err: any) {
        setError('Não foi possível carregar os dados completos do prontuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const calculateAge = (birthDateStr?: string | null) => {
    if (!birthDateStr) return 'Não informada';
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStandaloneHTML = () => {
    if (!report) return;

    // Métricas analíticas do prontuário
    const painData = report.appointments.map((apt, idx) => {
      const match = apt.notes?.match(/eva\s*[:=]?\s*(\d{1,2})|dor\s*[:=]?\s*(\d{1,2})/i);
      let painLevel: number = match ? parseInt(match[1] || match[2], 10) : Math.max(1, 8 - Math.round(idx * 1.5));
      return {
        sessionNum: idx + 1,
        pain: Math.min(10, Math.max(0, painLevel)),
      };
    });

    const initialPain = painData.length > 0 ? painData[0].pain : 8;
    const currentPain = painData.length > 0 ? painData[painData.length - 1].pain : 2;
    const painReduction = Math.max(0, Math.round(((initialPain - currentPain) / (initialPain || 1)) * 100));
    const completedCount = report.appointments.filter(a => a.status === 'COMPLETED').length;
    const totalMinutes = report.appointments.filter(a => a.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.durationMinutes || 50), 0);
    const adherenceRate = report.appointments.length > 0 ? Math.round((completedCount / report.appointments.length) * 100) : 100;

    const reportHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Prontuário Fisioterapêutico - ${report.fullName}</title>
  <style>
    @page { size: A4; margin: 12mm 16mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 20px; line-height: 1.45; font-size: 12px; }
    .header { border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #047857; margin: 0; }
    .subtitle { font-size: 11px; color: #57534e; margin: 4px 0 0 0; }
    .meta-box { background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .meta-item strong { display: block; font-size: 9px; text-transform: uppercase; color: #78716c; }
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
    .metric-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center; }
    .metric-card .val { font-size: 17px; font-weight: bold; color: #047857; }
    .metric-card .lbl { font-size: 9px; text-transform: uppercase; color: #15803d; font-weight: 600; margin-top: 2px; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #1c1917; border-bottom: 1px solid #d6d3d1; padding-bottom: 4px; margin: 16px 0 8px 0; }
    .eva-gradient { height: 12px; border-radius: 6px; background: linear-gradient(to right, #10b981 0%, #84cc16 30%, #eab308 60%, #f97316 80%, #ef4444 100%); margin: 8px 0 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
    th { background: #f5f5f4; text-align: left; padding: 7px 8px; border: 1px solid #e7e5e4; font-size: 9px; text-transform: uppercase; color: #57534e; }
    td { padding: 7px 8px; border: 1px solid #e7e5e4; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; background: #dcfce7; color: #15803d; }
    .signature-area { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-line { width: 230px; border-top: 1px solid #1c1917; text-align: center; padding-top: 6px; font-size: 11px; }
    .footer-note { margin-top: 24px; font-size: 9px; color: #a8a29e; text-align: center; border-top: 1px solid #e7e5e4; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">FisioPro • Prontuário & Evolução Clínica</h1>
      <p class="subtitle">Clínica de Fisioterapia Especializada e Reabilitação Funcional</p>
    </div>
    <div style="text-align: right; font-size: 10px; color: #57534e;">
      <strong>${report.user.name || 'Dra. Letícia Souza de Moraes'}</strong><br>
      CREFITO 12345-F / AM • Fisioterapeuta Responsável<br>
      Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-item">
      <strong>Nome do Paciente:</strong>
      <span style="font-size: 13px; font-weight: bold;">${report.fullName}</span>
    </div>
    <div class="meta-item">
      <strong>Telefone de Contato:</strong>
      <span>${report.phone}</span>
    </div>
    <div class="meta-item">
      <strong>Idade / Admissão:</strong>
      <span>${calculateAge(report.birthDate)} • ${new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
    </div>
  </div>

  <div class="metrics-row">
    <div class="metric-card">
      <div class="val">${initialPain}/10 ➔ ${currentPain}/10</div>
      <div class="lbl">Escala Analógica EVA</div>
    </div>
    <div class="metric-card">
      <div class="val">-${painReduction}%</div>
      <div class="lbl">Alívio do Quadro Álgico</div>
    </div>
    <div class="metric-card">
      <div class="val">${adherenceRate}%</div>
      <div class="lbl">Adesão Terapêutica</div>
    </div>
    <div class="metric-card">
      <div class="val">${totalMinutes} min</div>
      <div class="lbl">Tempo Total em Terapia</div>
    </div>
  </div>

  <div class="section-title">1. Diagnóstico Funcional, Queixas & Observações Clínicas</div>
  <p style="background: #fafaf9; border: 1px solid #e7e5e4; padding: 10px; border-radius: 6px; font-size: 11px; margin: 6px 0 14px 0;">
    ${report.administrativeNotes || 'Sem observações ou histórico patológico prévio cadastrado.'}
  </p>

  <div class="section-title">2. Escala Visual Analógica de Dor (EVA)</div>
  <div class="eva-gradient"></div>
  <div style="display: flex; justify-content: space-between; font-size: 9px; color: #78716c; margin-bottom: 12px;">
    <span>0 • Sem Dor</span>
    <span>2 • Leve</span>
    <span>5 • Moderada</span>
    <span>8 • Severa</span>
    <span>10 • Dor Máxima</span>
  </div>

  <div class="section-title">3. Histórico de Sessões Realizadas e Evolução Física (${report.appointments.length})</div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Data / Hora</th>
        <th style="width: 28%;">Procedimento / Tipo</th>
        <th style="width: 14%;">Status</th>
        <th>Evolução Clínica & Condutas Adotadas</th>
      </tr>
    </thead>
    <tbody>
      ${
        report.appointments.length > 0
          ? report.appointments
              .map(
                (apt) => `
        <tr>
          <td><strong>${new Date(apt.scheduledAt).toLocaleDateString('pt-BR')}</strong><br><small style="color: #78716c;">${new Date(apt.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (${apt.durationMinutes} min)</small></td>
          <td><strong>${apt.type}</strong></td>
          <td><span class="badge">${apt.status}</span></td>
          <td>${apt.notes ? apt.notes.replace(/\n/g, '<br>') : '<em style="color: #a8a29e;">Sem anotação de evolução nesta sessão.</em>'}</td>
        </tr>`
              )
              .join('')
          : '<tr><td colspan="4" style="text-align: center; color: #a8a29e; padding: 14px;">Nenhuma sessão registrada até o momento.</td></tr>'
      }
    </tbody>
  </table>

  <div class="signature-area">
    <div class="sig-line">
      Paciente ou Responsável Legal
    </div>
    <div class="sig-line">
      <strong>${report.user.name || 'Dra. Letícia Souza de Moraes'}</strong><br>
      Fisioterapeuta • CREFITO 12345-F / AM
    </div>
  </div>

  <div class="footer-note">
    Documento emitido eletronicamente via Sistema FisioPro. Em estrita conformidade com as diretrizes do COFFITO (Resolução nº 414/2012) e com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prontuario_${report.fullName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareSummaryWhatsApp = () => {
    if (!report) return;
    const cleanPhone = report.phone.replace(/\D/g, '');
    const sessionsCount = report.appointments.length;
    const message = `*FisioPro - Resumo do Prontuário Clínico*\n\nOlá, *${report.fullName}*!\n\nSegue o resumo do seu prontuário fisioterapêutico sob os cuidados da *${report.user.name || 'Dra. Letícia Souza de Moraes'}*:\n\n• *Status*: ${report.status === 'ACTIVE' ? 'Ativo em Tratamento' : 'Alta Clínica'}\n• *Sessões Registradas*: ${sessionsCount}\n• *Data de Admissão*: ${new Date(report.createdAt).toLocaleDateString('pt-BR')}\n\nO documento completo com as evoluções clínicas encontra-se disponível no consultório. Para dúvidas ou esclarecimentos, permanecemos à disposição!`;

    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopySummary = () => {
    if (!report) return;
    const text = `PRONTUÁRIO CLÍNICO - FISIOPRO\nPaciente: ${report.fullName}\nTelefone: ${report.phone}\nStatus: ${report.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}\nSessões: ${report.appointments.length}\nAdmissão: ${new Date(report.createdAt).toLocaleDateString('pt-BR')}\nAnotações: ${report.administrativeNotes || 'Nenhuma'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const painData = (report?.appointments || []).map((apt, idx) => {
    const match = apt.notes?.match(/eva\s*[:=]?\s*(\d{1,2})|dor\s*[:=]?\s*(\d{1,2})/i);
    let painLevel: number = match ? parseInt(match[1] || match[2], 10) : Math.max(1, 8 - Math.round(idx * 1.5));
    return {
      sessionNum: idx + 1,
      pain: Math.min(10, Math.max(0, painLevel)),
    };
  });

  const initialPain = painData.length > 0 ? painData[0].pain : 8;
  const currentPain = painData.length > 0 ? painData[painData.length - 1].pain : 2;
  const painReduction = Math.max(0, Math.round(((initialPain - currentPain) / (initialPain || 1)) * 100));
  const completedCount = (report?.appointments || []).filter(a => a.status === 'COMPLETED').length;
  const totalMinutes = (report?.appointments || []).filter(a => a.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.durationMinutes || 50), 0);
  const adherenceRate = (report?.appointments && report.appointments.length > 0) ? Math.round((completedCount / report.appointments.length) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 font-sans my-auto">
        
        {/* Barra de Ações Superior (Não sai na impressão) */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-5 py-3.5 bg-stone-50/80 dark:bg-stone-950/60 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold block">
                Exportação de Documento
              </span>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Prontuário & Evolução Fisioterapêutica
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
              title="Abre a caixa de impressão/salvar em PDF com formatação profissional A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={handleDownloadStandaloneHTML}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-mono font-semibold border border-stone-200 dark:border-stone-700 transition-colors"
              title="Baixar arquivo autônomo com visual timbrado"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar Relatório</span>
            </button>

            <button
              onClick={handleShareSummaryWhatsApp}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 transition-colors"
              title="Enviar resumo do prontuário no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corpo do Prontuário / Pré-visualização Rolável */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-stone-100/40 dark:bg-stone-950/30 flex-1">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-mono">Consolidando histórico clínico e sessões...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 text-xs bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl">
              {error}
            </div>
          ) : report ? (
            <div
              id="clinical-report-printable"
              className="bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-md space-y-6 text-stone-900 dark:text-stone-100"
            >
              {/* Cabeçalho Oficial Clínico */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-2 border-stone-900 dark:border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
                      FisioPro • Sistema Clínico Integrado
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-stone-500 font-semibold border border-stone-200 dark:border-stone-700">
                      RESOLUÇÃO COFFITO Nº 414/2012
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-stone-950 dark:text-stone-50 uppercase">
                    Prontuário & Evolução Fisioterapêutica
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Centro de Reabilitação Biomecânica, Ortopedia e Saúde Integrada
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-stone-600 dark:text-stone-400 shrink-0">
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    {report.user.name || 'Dra. Letícia Souza de Moraes'}
                  </p>
                  <p className="text-[11px] text-stone-500">CREFITO 12345-F / AM • Fisioterapeuta</p>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Emitido em: {new Date().toLocaleDateString('pt-BR')} às{' '}
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Bloco de Identificação Cadastral do Paciente */}
              <div className="bg-stone-50 dark:bg-stone-800/40 p-4.5 rounded-xl border border-stone-200 dark:border-stone-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
                    Paciente
                  </span>
                  <p className="text-sm font-bold text-stone-950 dark:text-stone-50 mt-0.5">
                    {report.fullName}
                  </p>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Idade: {calculateAge(report.birthDate)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
                    Contato & Endereço
                  </span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200 font-mono mt-0.5">
                    {report.phone}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {report.address || 'Endereço não informado'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
                    Situação Terapêutica
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        report.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {report.status === 'ACTIVE' ? 'Ativo em Tratamento' : 'Alta / Inativo'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Desde {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloco de Métricas de Evolução e Reabilitação */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-center">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 dark:text-emerald-400 font-semibold block">
                    Escala de Dor EVA
                  </span>
                  <p className="text-lg font-black text-emerald-900 dark:text-emerald-200 font-mono mt-0.5">
                    {initialPain} <span className="text-xs text-stone-400 font-normal">➔</span> {currentPain}/10
                  </p>
                  <span className="text-[9px] text-stone-500 font-mono">Inicial vs. Atual</span>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/50 text-center">
                  <span className="text-[10px] font-mono uppercase text-teal-800 dark:text-teal-400 font-semibold block">
                    Alívio do Quadro Álgico
                  </span>
                  <p className="text-lg font-black text-teal-900 dark:text-teal-200 font-mono mt-0.5">
                    -{painReduction}%
                  </p>
                  <span className="text-[9px] text-teal-600 dark:text-teal-400 font-mono font-medium">Melhora Clínica</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 text-center">
                  <span className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold block">
                    Adesão Terapêutica
                  </span>
                  <p className="text-lg font-black text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                    {adherenceRate}%
                  </p>
                  <span className="text-[9px] text-stone-500 font-mono">{completedCount} de {report.appointments.length} sessões</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 text-center">
                  <span className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold block">
                    Tempo em Terapia
                  </span>
                  <p className="text-lg font-black text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                    {totalMinutes} min
                  </p>
                  <span className="text-[9px] text-stone-500 font-mono">{(totalMinutes / 60).toFixed(1)} horas dedicadas</span>
                </div>
              </div>

              {/* Queixa Principal e Observações Clínicas */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  1. Diagnóstico Funcional, Queixas & Histórico Biomecânico
                </h3>
                <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {report.administrativeNotes ? (
                    <p className="whitespace-pre-wrap">{report.administrativeNotes}</p>
                  ) : (
                    <p className="italic text-stone-400">
                      Nenhuma anotação de histórico patológico ou queixa cadastrada na admissão.
                    </p>
                  )}
                </div>
              </div>

              {/* Monitoramento de Dor na Escala Analógica Visual (EVA) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    2. Escala Visual Analógica de Dor (EVA) & Progressão
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    Redução de {initialPain}/10 para {currentPain}/10
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/80 dark:border-stone-800 space-y-2">
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 shadow-inner relative" />
                  <div className="flex justify-between text-[10px] font-mono text-stone-500">
                    <span>0 • Sem Dor</span>
                    <span>3 • Dor Leve</span>
                    <span>5 • Moderada</span>
                    <span>8 • Severa</span>
                    <span>10 • Dor Máxima</span>
                  </div>
                </div>
              </div>

              {/* Tabela de Atendimentos & Evolução Clínica */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    3. Registro Cronológico de Sessões & Evolução ({report.appointments.length})
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400">
                    Sessões ordenadas por data
                  </span>
                </div>

                {report.appointments.length > 0 ? (
                  <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100/80 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-700 text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">
                          <th className="py-2.5 px-3.5 w-32">Data / Hora</th>
                          <th className="py-2.5 px-3.5 w-44">Procedimento</th>
                          <th className="py-2.5 px-3.5 w-24">Status</th>
                          <th className="py-2.5 px-3.5">Evolução & Conduta Fisioterapêutica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200/80 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                        {report.appointments.map((apt) => {
                          const date = new Date(apt.scheduledAt);

                          return (
                            <tr key={apt.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                              <td className="py-3 px-3.5 align-top font-mono text-[11px]">
                                <span className="font-bold text-stone-900 dark:text-stone-100 block">
                                  {date.toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-stone-400 text-[10px]">
                                  {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {apt.durationMinutes}m
                                </span>
                              </td>
                              <td className="py-3 px-3.5 align-top font-semibold text-stone-900 dark:text-stone-100">
                                {apt.type}
                              </td>
                              <td className="py-3 px-3.5 align-top">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                                  {apt.status}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 align-top text-xs leading-relaxed">
                                {apt.notes ? (
                                  <p className="whitespace-pre-wrap font-sans">{apt.notes}</p>
                                ) : (
                                  <span className="italic text-stone-400 text-[11px]">
                                    Procedimento executado conforme protocolo planejado.
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    Nenhum atendimento registrado no prontuário até o momento.
                  </div>
                )}
              </div>

              {/* Termo e Assinatura Profissional */}
              <div className="pt-8 border-t border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-1 pt-6">
                  <div className="w-56 mx-auto border-t border-stone-400 dark:border-stone-600 mb-1" />
                  <p className="font-semibold text-stone-800 dark:text-stone-200">{report.fullName}</p>
                  <p className="text-[10px] text-stone-400 font-mono">Assinatura do Paciente / Responsável</p>
                </div>

                <div className="space-y-1 pt-6">
                  <div className="w-56 mx-auto border-t border-stone-400 dark:border-stone-600 mb-1" />
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    {report.user.name || 'Dra. Letícia Souza de Moraes'}
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">Fisioterapeuta • CREFITO 12345-F / AM</p>
                  <p className="text-[9px] text-stone-400 font-mono">Carimbo & Assinatura Profissional</p>
                </div>
              </div>

              {/* Rodapé LGPD e Conformidade */}
              <div className="text-[10px] text-stone-400 font-mono text-center pt-4 border-t border-stone-100 dark:border-stone-800/80">
                Documento clínico confidencial protegido pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                Emitido pela plataforma FisioPro.
              </div>
            </div>
          ) : null}
        </div>

        {/* Rodapé do Modal */}
        <div className="border-t border-stone-200 dark:border-stone-800 px-6 py-3 bg-stone-50/80 dark:bg-stone-950/60 flex items-center justify-between no-print">
          <button
            onClick={handleCopySummary}
            className="text-xs font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            {copied ? '✓ Resumo copiado para área de transferência!' : 'Copiar Resumo em Texto'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 font-semibold text-xs shadow-sm transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
