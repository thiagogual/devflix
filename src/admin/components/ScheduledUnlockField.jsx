// src/admin/components/ScheduledUnlockField.jsx
// CORREÇÃO TIMEZONE: Todas as datas são tratadas como America/Sao_Paulo (UTC-3)
import { useState, useEffect } from 'react';

// São Paulo é UTC-3 fixo (Brasil aboliu horário de verão em 2019)
const SAO_PAULO_OFFSET = '-03:00';

/**
 * Converte um timestamp UTC (ISO string) para o formato datetime-local
 * exibindo o horário de São Paulo.
 */
const utcToSaoPauloLocal = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';

  // Usar Intl para converter para horário de São Paulo
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  const get = (type) => parts.find(p => p.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
};

/**
 * Converte um valor datetime-local (interpretado como horário de São Paulo)
 * para ISO string UTC.
 * Ex: "2026-03-27T22:00" → "2026-03-28T01:00:00.000Z"
 */
const saoPauloLocalToUTC = (localDateStr) => {
  if (!localDateStr) return null;
  // Adicionar offset de São Paulo para que new Date() interprete corretamente
  const date = new Date(localDateStr + ':00' + SAO_PAULO_OFFSET);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

/**
 * Retorna o datetime mínimo (agora + 1 minuto) no horário de São Paulo.
 */
const getMinDatetimeSaoPaulo = () => {
  const now = new Date(Date.now() + 60000); // +1 minuto
  return utcToSaoPauloLocal(now.toISOString());
};

const ScheduledUnlockField = ({ scheduledUnlock, onChange }) => {
  const [enableSchedule, setEnableSchedule] = useState(!!scheduledUnlock);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    setEnableSchedule(!!scheduledUnlock);
    if (scheduledUnlock) {
      const localDate = utcToSaoPauloLocal(scheduledUnlock);
      setScheduleDate(localDate);
    } else {
      setScheduleDate('');
    }
  }, [scheduledUnlock]);

  const handleToggle = (e) => {
    const isEnabled = e.target.checked;
    setEnableSchedule(isEnabled);

    if (isEnabled && scheduleDate) {
      const utcDate = saoPauloLocalToUTC(scheduleDate);
      onChange(utcDate);
    } else {
      onChange(null);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setScheduleDate(newDate);

    if (enableSchedule && newDate) {
      const utcDate = saoPauloLocalToUTC(newDate);
      if (utcDate) {
        onChange(utcDate);
        console.log(`[Schedule] São Paulo: ${newDate} → UTC: ${utcDate}`);
      } else {
        onChange(null);
        console.warn('[Schedule] Data inválida:', newDate);
      }
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enableSchedule}
            onChange={handleToggle}
          />
          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-netflix-red peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-netflix-red">
            <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${enableSchedule ? 'right-1' : 'left-1'}`}></div>
          </div>
          <span className="ml-3 text-white text-sm">
            Programar liberação automática
          </span>
        </label>
      </div>

      {enableSchedule && (
        <div>
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={handleDateChange}
            min={getMinDatetimeSaoPaulo()}
            className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Horário de Brasília (America/Sao_Paulo). O conteúdo será liberado automaticamente na data e hora programadas.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduledUnlockField;
