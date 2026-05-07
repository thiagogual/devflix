// src/components/SchedulerChecker.jsx
import { useEffect, useRef } from 'react';
import schedulerService from '../services/schedulerService';

/**
 * Componente global para gerenciar o serviço de agendamento
 * Este componente inicializa e gerencia o serviço que verifica e processa 
 * agendamentos de banners e materiais em background.
 */
const SchedulerChecker = () => {
  const serviceStartedRef = useRef(false);
  
  useEffect(() => {
    // Evitar inicialização duplicada
    if (serviceStartedRef.current) {
      return;
    }
    
    serviceStartedRef.current = true;
    
    console.log('[SchedulerChecker] Iniciando serviço de agendamento...');
    
    // Iniciar o serviço de agendamento
    schedulerService.start();
    
    // Verificar status do serviço
    const status = schedulerService.getStatus();
    console.log('[SchedulerChecker] Status do serviço:', status);
    
    // Cleanup - parar o serviço quando o componente for desmontado
    return () => {
      console.log('[SchedulerChecker] Parando serviço de agendamento...');
      schedulerService.stop();
      serviceStartedRef.current = false;
    };
  }, []);
  
  // Este componente não renderiza nada visível
  return null;
};

export default SchedulerChecker;