// src/firebase/storageService.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload de um arquivo para o Firebase Storage
 * @param {File} file - Arquivo a ser enviado
 * @param {string} path - Caminho no storage (ex: 'materials/aula1/')
 * @returns {Promise<{url: string, name: string}>} - URL do arquivo e nome
 */
export const uploadFile = async (file, path) => {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const fullPath = `${path}${fileName}`;

    // Criar referência no storage
    const storageRef = ref(storage, fullPath);

    // Fazer upload
    const snapshot = await uploadBytes(storageRef, file);

    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      name: file.name,
      path: fullPath,
      type: getFileType(file.name)
    };
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw error;
  }
};

/**
 * Upload de múltiplos arquivos
 * @param {FileList|File[]} files - Lista de arquivos
 * @param {string} path - Caminho base no storage
 * @param {function} onProgress - Callback para progresso (opcional)
 * @returns {Promise<Array<{url: string, name: string, type: string}>>}
 */
export const uploadMultipleFiles = async (files, path, onProgress = null) => {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const result = await uploadFile(file, path);
      results.push(result);

      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          current: file.name,
          percentage: Math.round(((i + 1) / total) * 100)
        });
      }
    } catch (error) {
      console.error(`Erro ao fazer upload de ${file.name}:`, error);
      results.push({
        error: true,
        name: file.name,
        message: error.message
      });
    }
  }

  return results;
};

/**
 * Detectar tipo de material baseado na extensão do arquivo
 * @param {string} fileName - Nome do arquivo
 * @returns {string} - Tipo do material
 */
const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();

  const typeMap = {
    // Slides/Apresentações
    'ppt': 'slides',
    'pptx': 'slides',
    'key': 'slides',
    'odp': 'slides',

    // Código
    'js': 'code',
    'jsx': 'code',
    'ts': 'code',
    'tsx': 'code',
    'py': 'code',
    'java': 'code',
    'html': 'code',
    'css': 'code',
    'json': 'code',
    'zip': 'code',
    'rar': 'code',

    // Documentos
    'pdf': 'doc',
    'doc': 'doc',
    'docx': 'doc',
    'txt': 'doc',
    'md': 'doc',
    'odt': 'doc',

    // Vídeos
    'mp4': 'video',
    'mov': 'video',
    'avi': 'video',
    'mkv': 'video',
    'webm': 'video',

    // Exercícios (planilhas podem ser exercícios)
    'xls': 'exercise',
    'xlsx': 'exercise',
    'csv': 'exercise'
  };

  return typeMap[extension] || 'link';
};

/**
 * Formatar nome do arquivo para exibição (remove extensão e caracteres especiais)
 * @param {string} fileName - Nome do arquivo
 * @returns {string} - Nome formatado
 */
export const formatFileName = (fileName) => {
  // Remove extensão
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  // Substitui underscores e hífens por espaços
  const formattedName = nameWithoutExt.replace(/[_-]/g, ' ');
  // Capitaliza primeira letra de cada palavra
  return formattedName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
