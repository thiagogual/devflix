// src/admin/components/DevflixEditor.jsx
import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import DevflixCard from './DevflixCard';

// Função para calcular as datas das aulas baseado na data da Aula 1
const calculateClassDates = (aula1Date) => {
  if (!aula1Date) return null;

  const date1 = new Date(aula1Date);

  // Aula 1: Terça às 20h (data informada)
  const aula1 = new Date(date1);
  aula1.setHours(20, 0, 0, 0);

  // Aula 2: Quarta às 20h (+1 dia)
  const aula2 = new Date(date1);
  aula2.setDate(aula2.getDate() + 1);
  aula2.setHours(20, 0, 0, 0);

  // Aula 3: Quinta às 20h (+2 dias)
  const aula3 = new Date(date1);
  aula3.setDate(aula3.getDate() + 2);
  aula3.setHours(20, 0, 0, 0);

  // Aula Bônus: Sábado às 16h (+4 dias)
  const aulaBonus = new Date(date1);
  aulaBonus.setDate(aulaBonus.getDate() + 4);
  aulaBonus.setHours(16, 0, 0, 0);

  // Aula 4: Domingo às 20h (+5 dias)
  const aula4 = new Date(date1);
  aula4.setDate(aula4.getDate() + 5);
  aula4.setHours(20, 0, 0, 0);

  return {
    aula1: aula1.toISOString(),
    aula2: aula2.toISOString(),
    aula3: aula3.toISOString(),
    aulaBonus: aulaBonus.toISOString(),
    aula4: aula4.toISOString()
  };
};

// Converter ISO para datetime-local format
const isoToDatetimeLocal = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Converter datetime-local para ISO
const datetimeLocalToIso = (datetimeLocal) => {
  if (!datetimeLocal) return '';
  const date = new Date(datetimeLocal);
  return date.toISOString();
};

const DevflixEditor = () => {
  const { devflixInstances, currentDevflix, selectDevflix, addDevflixInstance } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [aula1Date, setAula1Date] = useState('');
  const [classDates, setClassDates] = useState(null);

  const handleAula1DateChange = (e) => {
    const newDate = e.target.value;
    setAula1Date(newDate);

    if (newDate) {
      const calculatedDates = calculateClassDates(newDate);
      setClassDates(calculatedDates);
    } else {
      setClassDates(null);
    }
  };

  const handleAddDevflix = () => {
    // Validar o caminho
    const pathPattern = /^[a-z0-9\-]+$/;
    if (!pathPattern.test(path)) {
      alert('O caminho deve conter apenas letras minúsculas, números e hífen.');
      return;
    }

    // Verificar se o caminho já existe
    if (devflixInstances.some(instance => instance.path === path)) {
      alert(`O caminho /${path} já está em uso. Por favor, escolha outro.`);
      return;
    }

    // Validar data da aula 1
    if (!aula1Date || !classDates) {
      alert('Por favor, informe a data da Aula 1.');
      return;
    }

    const newDevflix = {
      name,
      path,
      classDates,
      bannerEnabled: false,
      banner: {
        text: '',
        buttonText: '',
        backgroundColor: '#ff3f3f',
        buttonColor: '#222222',
        buttonLink: ''
      }
    };

    const newId = addDevflixInstance(newDevflix);
    selectDevflix(newId);

    setShowForm(false);
    setName('');
    setPath('');
    setAula1Date('');
    setClassDates(null);
  };

  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Instâncias DevFlix</h3>
        
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nova DevFlix
        </button>
      </div>
      
      {showForm && (
        <div className="mb-6 bg-netflix-black p-4 rounded-md border border-gray-700">
          <h4 className="text-white font-medium mb-4">Nova Instância DevFlix</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nome</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: DevFlix 18"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Caminho</label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">/</span>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="flex-1 bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  placeholder="dev-xx"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">Apenas letras minúsculas, números e hífen.</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Data da Aula 1 (Terça-feira)</label>
              <input
                type="datetime-local"
                value={aula1Date}
                onChange={handleAula1DateChange}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
              />
              <p className="text-gray-500 text-xs mt-1">As demais aulas serão calculadas automaticamente.</p>
            </div>

            {/* Edição das datas das aulas */}
            {classDates && (
              <div className="bg-netflix-black rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white text-sm font-medium">Cronograma das Aulas</h5>
                  <span className="text-gray-500 text-xs">Você pode ajustar cada data individualmente</span>
                </div>

                {/* Aula 1 */}
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-netflix-red font-medium text-sm">Aula 1</span>
                  <input
                    type="datetime-local"
                    value={isoToDatetimeLocal(classDates.aula1)}
                    onChange={(e) => setClassDates(prev => ({
                      ...prev,
                      aula1: datetimeLocalToIso(e.target.value)
                    }))}
                    className="bg-netflix-dark border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:border-netflix-red focus:outline-none"
                  />
                </div>

                {/* Aula 2 */}
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-netflix-red font-medium text-sm">Aula 2</span>
                  <input
                    type="datetime-local"
                    value={isoToDatetimeLocal(classDates.aula2)}
                    onChange={(e) => setClassDates(prev => ({
                      ...prev,
                      aula2: datetimeLocalToIso(e.target.value)
                    }))}
                    className="bg-netflix-dark border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:border-netflix-red focus:outline-none"
                  />
                </div>

                {/* Aula 3 */}
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-netflix-red font-medium text-sm">Aula 3</span>
                  <input
                    type="datetime-local"
                    value={isoToDatetimeLocal(classDates.aula3)}
                    onChange={(e) => setClassDates(prev => ({
                      ...prev,
                      aula3: datetimeLocalToIso(e.target.value)
                    }))}
                    className="bg-netflix-dark border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:border-netflix-red focus:outline-none"
                  />
                </div>

                {/* Aula Bônus */}
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-yellow-500 font-medium text-sm">Bônus</span>
                  <input
                    type="datetime-local"
                    value={isoToDatetimeLocal(classDates.aulaBonus)}
                    onChange={(e) => setClassDates(prev => ({
                      ...prev,
                      aulaBonus: datetimeLocalToIso(e.target.value)
                    }))}
                    className="bg-netflix-dark border border-yellow-900/50 rounded px-2 py-1.5 text-white text-sm focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                {/* Aula 4 */}
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-netflix-red font-medium text-sm">Aula 4</span>
                  <input
                    type="datetime-local"
                    value={isoToDatetimeLocal(classDates.aula4)}
                    onChange={(e) => setClassDates(prev => ({
                      ...prev,
                      aula4: datetimeLocalToIso(e.target.value)
                    }))}
                    className="bg-netflix-dark border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:border-netflix-red focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDevflix}
                className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!name || !path || !aula1Date}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devflixInstances.map((instance) => (
          <DevflixCard 
            key={instance.id} 
            instance={instance} 
            onSelect={selectDevflix}
            isSelected={currentDevflix && currentDevflix.id === instance.id}
          />
        ))}
      </div>
      
      {devflixInstances.length === 0 && (
        <div className="text-center py-10">
          <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
          <p className="mt-4 text-gray-400">Nenhuma instância DevFlix encontrada.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors"
          >
            Criar Primeira DevFlix
          </button>
        </div>
      )}
    </div>
  );
};

export default DevflixEditor;