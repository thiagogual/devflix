// Utility functions for video handling

// Extract YouTube video ID from various URL formats
export const getYouTubeVideoId = (url) => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

// Extract Gumlet video/asset ID from URL
// Formats: https://play.gumlet.io/embed/ASSET_ID or https://video.gumlet.io/COLLECTION_ID/ASSET_ID/...
export const getGumletVideoId = (url) => {
  if (!url) return null;

  // https://play.gumlet.io/embed/ASSET_ID ou https://play.gumlet.io/embed/ASSET_ID/
  const playMatch = url.match(/play\.gumlet\.io\/embed\/([a-zA-Z0-9]+)/);
  if (playMatch) {
    return { assetId: playMatch[1], type: 'play' };
  }

  // https://video.gumlet.io/COLLECTION_ID/ASSET_ID/...
  const videoMatch = url.match(/video\.gumlet\.io\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/);
  if (videoMatch) {
    return { collectionId: videoMatch[1], assetId: videoMatch[2], type: 'video' };
  }

  // https://gumlet.tv/watch/ASSET_ID
  const tvMatch = url.match(/gumlet\.tv\/watch\/([a-zA-Z0-9]+)/);
  if (tvMatch) {
    return { assetId: tvMatch[1], type: 'tv' };
  }

  return null;
};

// Check if URL is a Gumlet video
export const isGumletUrl = (url) => {
  if (!url) return false;
  return url.includes('gumlet.io') || url.includes('gumlet.tv');
};

// Check if URL is a YouTube video
export const isYouTubeUrl = (url) => {
  if (!url) return false;
  return getYouTubeVideoId(url) !== null;
};

// Get YouTube embed URL
export const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
};

// Get YouTube thumbnail URL
export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Get Gumlet thumbnail URL
export const getGumletThumbnail = (url) => {
  const gumletId = getGumletVideoId(url);
  if (!gumletId) return null;

  // Para play.gumlet.io/embed/ASSET_ID - thumbnail está em video.gumlet.io
  if (gumletId.type === 'play' && gumletId.assetId) {
    return `https://video.gumlet.io/${gumletId.assetId}/thumbnail-1-0.png`;
  }

  // Para video.gumlet.io/COLLECTION_ID/ASSET_ID
  if (gumletId.type === 'video' && gumletId.collectionId && gumletId.assetId) {
    return `https://video.gumlet.io/${gumletId.collectionId}/${gumletId.assetId}/thumbnail-1-0.png`;
  }

  // Para gumlet.tv/watch/ASSET_ID
  if (gumletId.type === 'tv' && gumletId.assetId) {
    return `https://video.gumlet.io/${gumletId.assetId}/thumbnail-1-0.png`;
  }

  return null;
};

// Get thumbnail URL for any supported video platform
export const getVideoThumbnail = (url, gumletConfig = null) => {
  if (!url) return null;

  // Se tiver configuração do Gumlet com collectionId e assetId, usar diretamente
  if (gumletConfig && gumletConfig.collectionId && gumletConfig.assetId) {
    return `https://video.gumlet.io/${gumletConfig.collectionId}/${gumletConfig.assetId}/thumbnail-1-0.png`;
  }

  // Try YouTube first
  if (isYouTubeUrl(url)) {
    return getYouTubeThumbnail(url);
  }

  // Try Gumlet (sem config, tenta extrair da URL)
  if (isGumletUrl(url)) {
    return getGumletThumbnail(url);
  }

  return null;
};

// Build Gumlet thumbnail URL from collection and asset IDs
export const buildGumletThumbnailUrl = (collectionId, assetId) => {
  if (!collectionId || !assetId) return null;
  return `https://video.gumlet.io/${collectionId}/${assetId}/thumbnail-1-0.png`;
};

// Check if URL is a direct video file
export const isDirectVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const urlLower = url.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(ext));
};