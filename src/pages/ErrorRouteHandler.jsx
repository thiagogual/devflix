// src/pages/ErrorRouteHandler.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorPageStandalone from './ErrorPageStandalone';

/**
 * Componente que lida com os parâmetros de erro na URL
 * e renderiza a página de erro standalone com as mensagens adequadas
 */
const ErrorRouteHandler = () => {
  const [searchParams] = useSearchParams();
  const [errorProps, setErrorProps] = useState({
    message: "Página não encontrada",
    code: "404",
    showHomeLink: true
  });
  
  useEffect(() => {
    // Extrair mensagem e código dos parâmetros de URL
    const message = searchParams.get('message') || "Página não encontrada";
    const code = searchParams.get('code') || "404";
    const showHomeLink = searchParams.get('showHomeLink') !== 'false';
    
    setErrorProps({ message, code, showHomeLink });
  }, [searchParams]);
  
  return <ErrorPageStandalone {...errorProps} />;
};

export default ErrorRouteHandler;