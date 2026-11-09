import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  Send,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

export interface AppointmentDataForReminder {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  status: string;
  patient: {
    id: string;
    fullName: string;
    phone: string;
  };
}

interface WhatsAppReminderModalProps {
  appointment: AppointmentDataForReminder | null;
  isOpen: boolean;
  onClose: () => void;
  onReminderSent?: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onReminderSent,
}) => {
  const [templateType, setTemplateType] = useState<'reminder' | 'confirmation' | 'post_care' | 'custom'>('reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Formatações auxiliares
  const dateObj = appointment ? new Date(appointment.scheduledAt) : new Date();
  const dateFormatted = dateObj.toLocaleDateString('pt-BR');
  const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const patientFirstName = appointment ? appointment.patient.fullName.split(' ')[0] : 'Paciente';

  const generateDefaultMessage = (type: typeof templateType) => {
    if (!appointment) return '';

    switch (type) {
      case 'reminder':
        return `Olá, *${appointment.patient.fullName}*! Tudo bem? 👋\n\nAqui é do consultório da *Dra. Letícia Souza (FisioPro)*. Passando para confirmar sua sessão de *${appointment.type}* agendada para:\n\n📅 *Data:* ${dateFormatted}\n⏰ *Horário:* ${timeFormatted} (${appointment.durationMinutes} minutos)\n\n📍 *Orientações:* Pedimos chegar com 5 minutos de antecedência e vestir roupas leves para a realização dos movimentos.\n\nPor favor, responda com *"Confirmado"* para garantirmos seu atendimento. Muito obrigado(a)!`;

      case 'confirmation':
        return `Olá, *${appointment.patient.fullName}*! 🩺\n\nSua sessão de *${appointment.type}* com a *Dra. Letícia Souza* foi agendada com sucesso no *FisioPro*:\n\n📅 *Data:* ${dateFormatted}\n⏰ *Horário:* ${timeFormatted}\n\nCaso necessite de remarcação ou tenha algum imprevisto, solicitamos aviso com no mínimo 24h de antecedência. Até breve!`;

      case 'post_care':
        return `Olá, *${patientFirstName}*! Como você está se sentindo após a sessão de hoje? 🌿\n\nEsperamos que esteja bem! Gostaríamos de reforçar os cuidados fisioterapêuticos recomendados:\n• Mantenha uma boa hidratação ao longo do dia;\n• Realize os exercícios domiciliares de mobilidade conforme orientamos;\n• Evite sobrecargas posturais agudas nas próximas horas.\n\nQualquer desconforto atípico, estamos à sua disposição!`;

      case 'custom':
        return customMessage;
    }
  };

  useEffect(() => {
    if (appointment && templateType !== 'custom') {
      setCustomMessage(generateDefaultMessage(templateType));
    }
  }, [appointment, templateType]);

  if (!isOpen || !appointment) return null;

  const currentMessage = templateType === 'custom' ? customMessage : generateDefaultMessage(templateType);
  const cleanPhone = appointment.patient.phone.replace(/\D/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = async () => {
    try {
      setIsSending(true);

      // Registra evento de lembrete no backend para auditoria e histórico
      try {
        await api.post(`/appointments/${appointment.id}/reminder`, {
          messagePreview: currentMessage.slice(0, 150),
        });
      } catch (err) {
        console.warn('Erro ao registrar histórico no backend:', err);
      }

      // Abre o WhatsApp Web / App com o texto codificado
      const encodedMsg = encodeURIComponent(currentMessage);
      const url = `https://wa.me/55${cleanPhone}?text=${encodedMsg}`;
      window.open(url, '_blank');

      setSentSuccess(true);
      if (onReminderSent) onReminderSent();

      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1800);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 font-sans my-auto transition-all">
        
        {/* Header Elegante com Identidade WhatsApp */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-6 py-4 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold block">
                Disparo Oficial WhatsApp
              </span>
              <h2 className="text-base font-bold text-stone-950 dark:text-stone-100">
                Lembrete de Sessão & Contato
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Card Resumo do Atendimento */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase block font-semibold">Paciente:</span>
              <p className="font-bold text-stone-950 dark:text-stone-50 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                {appointment.patient.fullName}
              </p>
              <p className="text-stone-500 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {appointment.patient.phone}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase block font-semibold">Agendamento:</span>
              <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {dateFormatted} às {timeFormatted}
              </p>
              <p className="text-stone-500 text-[11px] mt-0.5 truncate">
                {appointment.type} • {appointment.durationMinutes} min
              </p>
            </div>
          </div>

          {/* Seleção de Templates */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold mb-2">
              Selecione o Modelo de Mensagem:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'reminder', label: 'Lembrete de Sessão', icon: Clock },
                { id: 'confirmation', label: 'Confirmação', icon: Calendar },
                { id: 'post_care', label: 'Orientações Pós', icon: Sparkles },
                { id: 'custom', label: 'Personalizado', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                const active = templateType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTemplateType(item.id as any);
                      if (item.id === 'custom') {
                        setCustomMessage(generateDefaultMessage(templateType));
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`} />
                    <span className="text-[11px] leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor se customizado ou Pré-visualização tipo Chat WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold">
                Pré-visualização da Mensagem:
              </label>
              <span className="text-[10px] font-mono text-stone-400">
                {currentMessage.length} caracteres
              </span>
            </div>

            {templateType === 'custom' ? (
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={7}
                placeholder="Escreva a mensagem personalizada..."
                className="w-full p-3.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
              />
            ) : (
              /* Bolha Estilizada do WhatsApp */
              <div className="p-4 rounded-2xl bg-[#efeae2] dark:bg-[#111b21] border border-stone-200 dark:border-stone-800 shadow-inner">
                <div className="max-w-[92%] ml-auto bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] p-3.5 rounded-2xl rounded-tr-xs shadow-sm space-y-2 text-xs font-sans leading-relaxed relative">
                  <div className="whitespace-pre-wrap">{currentMessage}</div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] dark:text-[#8696a0] font-mono pt-1">
                    <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="border-t border-stone-200 dark:border-stone-800 px-6 py-4 bg-stone-50/80 dark:bg-stone-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-colors w-full sm:w-auto justify-center"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mensagem Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copiar Mensagem</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isSending || !cleanPhone}
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all w-full sm:w-auto justify-center disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparando WhatsApp...</span>
                </>
              ) : sentSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enviado no WhatsApp!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Disparar no WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
