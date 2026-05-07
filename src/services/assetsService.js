// src/services/assetsService.js

/**
 * Get a list of all video files in the public assets directory
 * This uses a fetch request to a special route that lists the files
 * in the project's public directory
 * @returns {Promise<Array>} Array of video objects with name and path
 */
export const getLocalVideos = async () => {
    try {
      // In a real application, you would need a server endpoint that returns
      // a list of files in your public/assets/videos directory
      
      // This simulates what that endpoint would return
      // Replace this with an actual API call in production
      
      // For demonstration, we'll fake an API response
      const response = await fetch('/api/assets/videos');
      
      if (!response.ok) {
        throw new Error(`Error fetching videos: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.videos;
    } catch (error) {
      console.error("Error getting local videos:", error);
      
      // If the API call fails, we can scan for common video files
      // This is just a fallback and won't find dynamically added files
      return scanForLocalVideos();
    }
  };
  
  /**
   * Scan for common video files in the public directory
   * This is a fallback method when the API is not available
   * @returns {Array} Array of video objects with name and path
   */
  const scanForLocalVideos = () => {
    // We'll hard-code some common paths to check
    const commonPaths = [
      '/assets/videos',
      '/videos',
      '/media/videos',
      '/assets/media'
    ];
    
    // List of common video extensions to check
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    
    // We'll try to discover videos by testing if they exist
    // This approach isn't ideal, but can work as a fallback
    const discoveredVideos = [];
    
    // Try some common video filenames in each path
    const commonNames = ['background', 'intro', 'demo', 'promo', 'header', 'main'];
    
    commonPaths.forEach(path => {
      commonNames.forEach(name => {
        videoExtensions.forEach(ext => {
          const videoPath = `${path}/${name}${ext}`;
          
          // Check if the file exists by creating an Image object
          // This is a hack, but can work for basic detection
          const img = new Image();
          img.src = videoPath;
          
          // If the image loads successfully, it might be a valid path
          // (This isn't reliable but it's a fallback)
          img.onload = () => {
            discoveredVideos.push({
              name: `${name}${ext}`,
              displayName: name.charAt(0).toUpperCase() + name.slice(1),
              path: videoPath
            });
          };
        });
      });
    });
    
    // We can also check for numbered videos (like aula1.mp4, aula2.mp4)
    commonPaths.forEach(path => {
      for (let i = 1; i <= 10; i++) {
        videoExtensions.forEach(ext => {
          const videoPath = `${path}/aula${i}${ext}`;
          const img = new Image();
          img.src = videoPath;
          img.onload = () => {
            discoveredVideos.push({
              name: `aula${i}${ext}`,
              displayName: `Aula ${i}`,
              path: videoPath
            });
          };
        });
      }
    });
    
    // If we still haven't found any videos, return some defaults
    if (discoveredVideos.length === 0) {
      return [
        { name: 'background.mp4', displayName: 'Background', path: '/assets/videos/background.mp4' },
        { name: 'intro.mp4', displayName: 'Intro', path: '/assets/videos/intro.mp4' },
        { name: 'aula1.mp4', displayName: 'Aula 1', path: '/assets/videos/aula1.mp4' },
        { name: 'aula2.mp4', displayName: 'Aula 2', path: '/assets/videos/aula2.mp4' }
      ];
    }
    
    return discoveredVideos;
  };
  
  /**
   * Implementation using the browser's fetch API to send a request to the server
   * In a real application, you would create an endpoint in your server that 
   * returns the list of video files in the assets directory
   */
  export const discoverVideosInDirectory = async (directory = '/assets/videos/') => {
    // This function simulates a server API call
    // You would need to implement a server-side endpoint for this
    
    // Mock response for a directory listing
    const mockResponse = {
      files: [
        { name: 'background.mp4', displayName: 'Background Video', path: '/assets/videos/background.mp4' },
        { name: 'promo.mp4', displayName: 'Promo Video', path: '/assets/videos/promo.mp4' },
        { name: 'course_intro.mp4', displayName: 'Course Introduction', path: '/assets/videos/course_intro.mp4' },
        { name: 'aula1.mp4', displayName: 'Aula 1', path: '/assets/videos/aula1.mp4' },
        { name: 'aula2.mp4', displayName: 'Aula 2', path: '/assets/videos/aula2.mp4' },
        { name: 'aula3.mp4', displayName: 'Aula 3', path: '/assets/videos/aula3.mp4' },
        { name: 'aula4.mp4', displayName: 'Aula 4', path: '/assets/videos/aula4.mp4' }
      ]
    };
    
    // In a real implementation, you would make an actual API call
    // return fetch('/api/directory?path=' + encodeURIComponent(directory))
    //   .then(response => response.json());
    
    // For demonstration, we'll return the mock data
    return mockResponse.files;
  };