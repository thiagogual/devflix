// src/admin/components/MaterialsEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import ScheduledUnlockField from './ScheduledUnlockField';

// São Paulo é UTC-3 fixo (Brasil aboliu horário de verão em 2019)
const SAO_PAULO_OFFSET = '-03:00';

/** Converte datetime-local (São Paulo) para ISO UTC */
const saoPauloLocalToUTC = (localDateStr) => {
  if (!localDateStr) return null;
  const date = new Date(localDateStr + ':00' + SAO_PAULO_OFFSET);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

/** Retorna datetime mínimo (agora +1min) no horário de São Paulo */
const getMinDatetimeSP = () => {
  const now = new Date(Date.now() + 60000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(now);
  const get = (type) => parts.find(p => p.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
};
import { uploadMultipleFiles, formatFileName } from '../../firebase/storageService';

const MaterialsEditor = () => {
  const { currentDevflix, addMaterial, updateMaterial, deleteMaterial, updateMaterials } = useAdmin();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para programação em lote
  const [showBulkSchedule, setShowBulkSchedule] = useState(false);
  const [bulkScheduleDate, setBulkScheduleDate] = useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Estado para upload de múltiplos arquivos
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  // Estado para o formulário
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState('slides');
  const [formLocked, setFormLocked] = useState(false);
  const [formScheduledUnlock, setFormScheduledUnlock] = useState(null);
  
  // Tipos de materiais disponíveis
  const materialTypes = [
    { value: 'slides', label: 'Slides', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { value: 'code', label: 'Código', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { value: 'exercise', label: 'Exercício', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { value: 'doc', label: 'Documentação', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { value: 'video', label: 'Vídeo', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { value: 'link', label: 'Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' }
  ];
  
  useEffect(() => {
    if (currentDevflix && currentDevflix.classes.length > 0) {
      const firstClassId = currentDevflix.classes[0].id;
      setSelectedClassId(firstClassId);
    }
  }, [currentDevflix]);
  
  useEffect(() => {
    if (currentDevflix && selectedClassId) {
      // Buscar materiais para a aula selecionada
      const classMaterials = currentDevflix.materials.find(
        m => m.classId === selectedClassId
      );
      setMaterials(classMaterials ? classMaterials.items : []);
    } else {
      setMaterials([]);
    }
  }, [currentDevflix, selectedClassId]);
  
  // O agendamento de materiais é gerenciado pelo SchedulerService global (SchedulerChecker).
  // Não precisamos de verificação duplicada aqui.

  const resetForm = () => {
    setFormTitle('');
    setFormUrl('');
    setFormType('slides');
    setFormLocked(false);
    setFormScheduledUnlock(null);
    setEditingId(null);
  };
  
  const handleAddClick = () => {
    setShowForm(true);
    resetForm();
  };
  
  const handleEditClick = (material) => {
    setShowForm(true);
    setEditingId(material.id);
    setFormTitle(material.title);
    setFormUrl(material.url);
    setFormType(material.type);
    setFormLocked(material.locked);
    setFormScheduledUnlock(material.scheduledUnlock || null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // CORREÇÃO: Verificar se a data de agendamento já passou
      let effectiveLocked = formLocked;
      let effectiveScheduledUnlock = formScheduledUnlock;
      
      if (formLocked && formScheduledUnlock) {
        const scheduledTime = new Date(formScheduledUnlock).getTime();
        const now = new Date().getTime();
        
        // Se o horário já passou, desbloquear imediatamente
        if (scheduledTime <= now) {
          console.log("Scheduled time already passed, unlocking material immediately");
          effectiveLocked = false;
          effectiveScheduledUnlock = null;
        }
      }
      
      // Montar dados do material
      const materialData = {
        title: formTitle,
        url: formUrl,
        type: formType,
        locked: effectiveLocked,
        scheduledUnlock: effectiveScheduledUnlock
      };

      // Limpar unlockedAt quando reagendar para que o scheduler não interfira
      if (effectiveLocked && effectiveScheduledUnlock) {
        materialData.unlockedAt = null;
      }
      
      if (editingId) {
        // Atualizando material existente
        await updateMaterial(selectedClassId, editingId, materialData);
        alert('Material atualizado com sucesso!');
      } else {
        // Adicionando novo material
        await addMaterial(selectedClassId, materialData);
        alert('Material adicionado com sucesso!');
      }
      
      // Atualizar a lista de materiais
      if (currentDevflix) {
        const updatedMaterials = currentDevflix.materials.find(
          m => m.classId === selectedClassId
        );
        setMaterials(updatedMaterials ? updatedMaterials.items : []);
      }
      
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      alert(`Erro ao ${editingId ? 'atualizar' : 'adicionar'} material: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este material?')) return;
    
    try {
      await deleteMaterial(selectedClassId, id);
      alert('Material excluído com sucesso!');
      
      // Atualizar a lista de materiais
      if (currentDevflix) {
        const updatedMaterials = currentDevflix.materials.find(
          m => m.classId === selectedClassId
        );
        setMaterials(updatedMaterials ? updatedMaterials.items : []);
      }
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      alert(`Erro ao excluir material: ${error.message}`);
    }
  };
  
  // Componente para ícone de material
  const MaterialIcon = ({ type }) => {
    const icon = materialTypes.find(t => t.value === type)?.icon || materialTypes[0].icon;
    
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
      </svg>
    );
  };
  
  // Função utilitária para formatar a data
  const formatScheduleDate = (dateString) => {
    if (!dateString) return 'Não agendado';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Verificar se uma data de agendamento está próxima (menos de 5 minutos)
  const isScheduleSoon = (dateString) => {
    if (!dateString) return false;

    const scheduledTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos em milissegundos

    return scheduledTime - now <= fiveMinutes && scheduledTime > now;
  };

  // Função para programar todos os materiais da aula selecionada
  const handleBulkSchedule = async (e) => {
    e.preventDefault();

    if (!bulkScheduleDate || materials.length === 0) {
      alert('Selecione uma data e certifique-se de que há materiais na aula.');
      return;
    }

    setIsBulkSubmitting(true);

    try {
      // Converter datetime-local (São Paulo) para UTC
      const utcIso = saoPauloLocalToUTC(bulkScheduleDate);
      if (!utcIso) {
        alert('Data inválida.');
        setIsBulkSubmitting(false);
        return;
      }

      const scheduledTime = new Date(utcIso);
      const now = new Date();

      // Se a data já passou, não permitir
      if (scheduledTime <= now) {
        alert('A data de liberação deve ser no futuro.');
        setIsBulkSubmitting(false);
        return;
      }

      // Atualizar todos os materiais da aula
      // IMPORTANTE: Limpar unlockedAt para que o scheduler não interfira
      const updatedItems = materials.map(item => ({
        ...item,
        locked: true,
        scheduledUnlock: utcIso,
        unlockedAt: null
      }));

      await updateMaterials(selectedClassId, updatedItems);
      setMaterials(updatedItems);

      alert(`${materials.length} materiais programados para ${scheduledTime.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}!`);
      setShowBulkSchedule(false);
      setBulkScheduleDate('');
    } catch (error) {
      console.error('Erro ao programar materiais em lote:', error);
      alert(`Erro ao programar materiais: ${error.message}`);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Função para liberar todos os materiais da aula imediatamente
  const handleBulkUnlock = async () => {
    if (materials.length === 0) {
      alert('Não há materiais para liberar.');
      return;
    }

    if (!window.confirm(`Deseja liberar todos os ${materials.length} materiais da aula imediatamente?`)) {
      return;
    }

    setIsBulkSubmitting(true);

    try {
      const updatedItems = materials.map(item => ({
        ...item,
        locked: false,
        scheduledUnlock: null
      }));

      await updateMaterials(selectedClassId, updatedItems);
      setMaterials(updatedItems);

      alert(`${materials.length} materiais liberados com sucesso!`);
    } catch (error) {
      console.error('Erro ao liberar materiais em lote:', error);
      alert(`Erro ao liberar materiais: ${error.message}`);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Função para trancar todos os materiais da aula
  const handleBulkLock = async () => {
    if (materials.length === 0) {
      alert('Não há materiais para trancar.');
      return;
    }

    if (!window.confirm(`Deseja trancar todos os ${materials.length} materiais da aula?`)) {
      return;
    }

    setIsBulkSubmitting(true);

    try {
      const updatedItems = materials.map(item => ({
        ...item,
        locked: true,
        scheduledUnlock: null
      }));

      await updateMaterials(selectedClassId, updatedItems);
      setMaterials(updatedItems);

      alert(`${materials.length} materiais trancados com sucesso!`);
    } catch (error) {
      console.error('Erro ao trancar materiais em lote:', error);
      alert(`Erro ao trancar materiais: ${error.message}`);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Função para upload de múltiplos arquivos
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!selectedClassId) {
      alert('Selecione uma aula primeiro.');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ completed: 0, total: files.length, current: '', percentage: 0 });

    try {
      // Caminho no storage: materials/[instanceId]/[classId]/
      const storagePath = `materials/${currentDevflix.id}/${selectedClassId}/`;

      // Fazer upload de todos os arquivos
      const results = await uploadMultipleFiles(files, storagePath, (progress) => {
        setUploadProgress(progress);
      });

      // Filtrar apenas os uploads bem-sucedidos
      const successfulUploads = results.filter(r => !r.error);
      const failedUploads = results.filter(r => r.error);

      // Adicionar cada arquivo como material
      for (const upload of successfulUploads) {
        await addMaterial(selectedClassId, {
          title: formatFileName(upload.name),
          url: upload.url,
          type: upload.type,
          locked: false,
          scheduledUnlock: null
        });
      }

      // Atualizar a lista de materiais
      if (currentDevflix) {
        const updatedMaterials = currentDevflix.materials.find(
          m => m.classId === selectedClassId
        );
        setMaterials(updatedMaterials ? updatedMaterials.items : []);
      }

      // Mostrar resultado
      if (failedUploads.length > 0) {
        alert(`${successfulUploads.length} arquivo(s) enviado(s) com sucesso!\n${failedUploads.length} arquivo(s) falharam.`);
      } else {
        alert(`${successfulUploads.length} arquivo(s) enviado(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos:', error);
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Limpar o input de arquivos
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Formatar datetime-local mínimo
  const getMinDatetime = () => getMinDatetimeSP();
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para gerenciar os materiais.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Materiais de Apoio</h3>

        <div className="flex gap-2">
          <button
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Adicionar Link
          </button>
          <label className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center cursor-pointer">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            Enviar Arquivos
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,.rar,.js,.jsx,.ts,.tsx,.html,.css,.json,.mp4,.mov,.avi,.mkv,.webm"
            />
          </label>
        </div>
      </div>
      
      {/* Seletor de aula */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Selecione a Aula</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
        >
          {currentDevflix.classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.title}
            </option>
          ))}
        </select>
      </div>

      {/* Ações em lote */}
      {materials.length > 0 && (
        <div className="mb-6 p-4 bg-netflix-black rounded-lg border border-gray-700">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Ações em Lote ({materials.length} materiais)
          </h4>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowBulkSchedule(!showBulkSchedule)}
              disabled={isBulkSubmitting}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Programar Liberação
            </button>

            <button
              onClick={handleBulkUnlock}
              disabled={isBulkSubmitting}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
              </svg>
              Liberar Todos
            </button>

            <button
              onClick={handleBulkLock}
              disabled={isBulkSubmitting}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Trancar Todos
            </button>
          </div>

          {/* Formulário de programação em lote */}
          {showBulkSchedule && (
            <form onSubmit={handleBulkSchedule} className="mt-4 p-3 bg-gray-800 rounded-lg">
              <label className="block text-gray-400 text-sm mb-2">
                Data e hora para liberar todos os materiais desta aula:
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={bulkScheduleDate}
                  onChange={(e) => setBulkScheduleDate(e.target.value)}
                  min={getMinDatetime()}
                  className="flex-1 bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isBulkSubmitting || !bulkScheduleDate}
                  className={`px-4 py-2 ${isBulkSubmitting ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white rounded transition-colors`}
                >
                  {isBulkSubmitting ? 'Salvando...' : 'Aplicar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkSchedule(false);
                    setBulkScheduleDate('');
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Isso irá trancar e programar a liberação de todos os {materials.length} materiais desta aula.
              </p>
            </form>
          )}
        </div>
      )}
      
      {/* Formulário para adicionar/editar material */}
      {showForm && (
        <div className="mb-6 bg-netflix-black p-4 rounded-md border border-gray-700">
          <h4 className="text-white font-medium mb-4">
            {editingId ? 'Editar Material' : 'Novo Material'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Título</label>
              <input 
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: Slides da Aula"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">URL</label>
              <input 
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="https://exemplo.com/material"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Tipo</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                >
                  {materialTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Status</label>
                <div className="flex items-center h-10">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formLocked}
                      onChange={(e) => setFormLocked(e.target.checked)}
                    />
                    <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-red-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-netflix-red">
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${formLocked ? 'right-1' : 'left-1'}`}></div>
                    </div>
                    <span className="ml-3 text-white text-sm">
                      {formLocked ? 'Trancado' : 'Liberado'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Programação de liberação automática */}
            {formLocked && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">Liberação Programada</label>
                <ScheduledUnlockField 
                  scheduledUnlock={formScheduledUnlock}
                  onChange={(date) => setFormScheduledUnlock(date)}
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${isSubmitting ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white rounded transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : (editingId ? 'Atualizar' : 'Adicionar')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Indicador de progresso do upload */}
      {isUploading && uploadProgress && (
        <div className="mb-6 bg-netflix-black p-4 rounded-md border border-green-600">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Enviando arquivos...
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Progresso: {uploadProgress.completed} de {uploadProgress.total}</span>
              <span>{uploadProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              Enviando: {uploadProgress.current}
            </p>
          </div>
        </div>
      )}

      {/* Lista de materiais */}
      {materials.length > 0 ? (
        <div className="space-y-3">
          {materials.map((material) => (
            <div 
              key={material.id} 
              className={`flex items-center justify-between bg-netflix-black p-3 rounded-md border ${
                isScheduleSoon(material.scheduledUnlock) ? 'border-yellow-500' : 'border-gray-800'
              } hover:border-gray-700 transition-colors`}
            >
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  material.locked ? 'bg-red-900/20' : 'bg-netflix-red/20'
                } mr-4`}>
                  {material.locked ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  ) : (
                    <MaterialIcon type={material.type} />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-medium">{material.title}</h4>
                  <p className="text-gray-400 text-sm truncate max-w-md">{material.url}</p>
                  
                  {/* Mostrar informações de agendamento */}
                  {material.locked && material.scheduledUnlock && (
                    <p className={`text-xs mt-1 ${
                      isScheduleSoon(material.scheduledUnlock) ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Liberação programada: {formatScheduleDate(material.scheduledUnlock)}
                      {isScheduleSoon(material.scheduledUnlock) && ' (em breve)'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditClick(material)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors text-gray-300"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => handleDelete(material.id)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-red-600 transition-colors text-gray-300"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="mt-4 text-gray-400">Nenhum material cadastrado para esta aula.</p>
          <button
            onClick={handleAddClick}
            className="mt-2 px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Adicionar Material
          </button>
        </div>
      )}
    </div>
  );
};

export default MaterialsEditor;