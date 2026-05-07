// src/components/SupportBubble.jsx
import { useEffect } from 'react';

const SupportBubble = () => {
  useEffect(() => {
    // Check if script is already loaded to avoid duplicates
    if (document.querySelector('script[data-chatwoot-sdk]')) {
      return;
    }

    const BASE_URL = "https://chat.devclub.com.br";
    const script = document.createElement("script");
    script.src = `${BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.setAttribute('data-chatwoot-sdk', 'true');
    
    script.onload = function() {
      if (window.chatwootSDK) {
        window.chatwootSDK.run({
          websiteToken: 'FgUmyCkt4qhdkNWTpmN9RNFa',
          baseUrl: BASE_URL
        });
      }
    };

    // Insert script before the first script tag or at the end of head
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // Cleanup function to remove script if component unmounts
    return () => {
      const existingScript = document.querySelector('script[data-chatwoot-sdk]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SupportBubble;

