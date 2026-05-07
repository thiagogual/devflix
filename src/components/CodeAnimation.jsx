// src/components/CodeAnimation.jsx
import { useEffect, useRef } from 'react';

const CodeAnimation = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Limpar o contêiner
    container.innerHTML = '';
    
    // Exemplos de trechos de código
    const codeSnippets = [
      'function hello() { console.log("Hello, Dev!"); }',
      'const app = () => { return <div>DevFlix</div>; }',
      'import React from "react";',
      'npm install tailwindcss',
      'git commit -m "Initial commit"',
      'const [state, setState] = useState(null);',
      'useEffect(() => { fetchData(); }, []);',
      '<div className="flex items-center">',
      'export default function App() { ... }',
      'addEventListener("click", handleClick);',
      '.then(response => response.json())',
      'const sum = (a, b) => a + b;',
      'document.querySelector(".container");',
      'for (let i = 0; i < array.length; i++) { }',
      'array.map(item => <Card key={item.id} />)',
      'switch (value) { case 1: return "One"; }',
      'class Component extends React.Component { }',
      'const { id, name } = user;',
      'try { await api.get() } catch (error) { }',
      'localStorage.setItem("token", token);'
    ];
    
    // Criar linhas de código com direções aleatórias horizontais
    const createCodeLine = () => {
      const codeLine = document.createElement('div');
      codeLine.className = 'code-line';
      
      // Texto aleatório dos snippets
      const snippetIndex = Math.floor(Math.random() * codeSnippets.length);
      codeLine.textContent = codeSnippets[snippetIndex];
      
      // Estilização aleatória
      const size = 0.7 + Math.random() * 0.6;
      codeLine.style.fontSize = `${size}rem`;
      
      // Cores em tons variados de verde (4 variações principais)
      const colorVariation = Math.floor(Math.random() * 4);
      let greenValue, blueValue;
      
      switch (colorVariation) {
        case 0: // Verde claro
          greenValue = 200 + Math.floor(Math.random() * 55); // 200-255
          blueValue = Math.floor(Math.random() * 30);  // 0-30
          break;
        case 1: // Verde médio
          greenValue = 150 + Math.floor(Math.random() * 50); // 150-200
          blueValue = Math.floor(Math.random() * 40);  // 0-40
          break;
        case 2: // Verde escuro
          greenValue = 100 + Math.floor(Math.random() * 50); // 100-150
          blueValue = Math.floor(Math.random() * 50);  // 0-50
          break;
        case 3: // Quase ciano
          greenValue = 180 + Math.floor(Math.random() * 75); // 180-255
          blueValue = 50 + Math.floor(Math.random() * 100);  // 50-150
          break;
      }
      
      codeLine.style.color = `rgb(0, ${greenValue}, ${blueValue})`;
      
      // Opacidade aleatória para efeito de profundidade
      const opacity = 0.15 + Math.random() * 0.5; // 0.15-0.65
      codeLine.style.opacity = opacity.toString();
      
      // Filtro de desfoque mais forte para maior harmonização
      const blurAmount = 1 + Math.random() * 3; // 1-4px de blur (aumentado)
      codeLine.style.filter = `blur(${blurAmount}px)`;
      
      // Adicionar um efeito de text-shadow para brilho
      const glowIntensity = Math.random() * 0.4; // 0-0.4
      codeLine.style.textShadow = `0 0 ${3 + Math.random() * 5}px rgba(0, ${greenValue}, ${blueValue}, ${glowIntensity})`;
      
      return codeLine;
    };
    
    // Adicionar linhas iniciais
    const yPositions = [];
    const ySegments = 30; // Dividir a tela em segmentos para distribuir melhor
    const segmentHeight = 100 / ySegments;
    
    // Gerar posições verticais
    for (let i = 0; i < ySegments; i++) {
      // Adicionar uma posição para cada segmento com alguma variação interna
      const basePosition = i * segmentHeight;
      const variableOffset = Math.random() * segmentHeight * 0.7;
      yPositions.push(basePosition + variableOffset);
    }
    
    // Embaralhar as posições
    yPositions.sort(() => Math.random() - 0.5);
    
    // Criar linhas iniciais distribuídas por toda a tela
    yPositions.forEach((yPos, index) => {
      // Criar uma linha
      const line = createCodeLine();
      line.style.top = `${yPos}%`;
      
      // Distribuir horizontalmente por toda a tela
      // Usar entre 5% e 95% da largura da tela
      const xPos = 5 + Math.random() * 90;
      
      // Determinar a direção com base na paridade do índice
      const isEven = index % 2 === 0;
      
      if (isEven) {
        // Da esquerda para a direita
        line.style.left = `${xPos}%`;
        // Ajustar a animação para iniciar a partir desta posição
        const initialDelay = `-${Math.random() * 15}s`; // Delay negativo para iniciar em pontos aleatórios da animação
        const duration = 15 + (yPos / 10) + (Math.random() * 10);
        line.style.animation = `code-scroll-right ${duration}s linear infinite`;
        line.style.animationDelay = initialDelay;
      } else {
        // Da direita para a esquerda
        line.style.left = `${xPos}%`;
        // Ajustar a animação para iniciar a partir desta posição
        const initialDelay = `-${Math.random() * 15}s`; // Delay negativo para iniciar em pontos aleatórios da animação
        const duration = 15 + (yPos / 10) + (Math.random() * 10);
        line.style.animation = `code-scroll-left ${duration}s linear infinite`;
        line.style.animationDelay = initialDelay;
      }
      
      container.appendChild(line);
    });
    
    // Continuar gerando linhas periodicamente para manter a animação viva
    const intervalId = setInterval(() => {
      // Adicionar novas linhas aleatoriamente
      if (container.childNodes.length < 100) {
        const newLine = createCodeLine();
        
        // Posicionamento vertical aleatório
        const yPos = Math.random() * 100;
        newLine.style.top = `${yPos}%`;
        
        // Posicionamento horizontal aleatório - 20% de chance de começar no meio da tela
        const startInMiddle = Math.random() < 0.2;
        const goingRight = Math.random() > 0.5;
        
        if (startInMiddle) {
          // Começar em algum lugar no meio da tela (entre 10% e 90%)
          const xPos = 10 + Math.random() * 80;
          newLine.style.left = `${xPos}%`;
          
          // Determinar a direção e configurar a animação
          const duration = 15 + Math.random() * 20;
          const initialDelay = `-${Math.random() * 15}s`;
          newLine.style.animation = goingRight 
            ? `code-scroll-right ${duration}s linear infinite`
            : `code-scroll-left ${duration}s linear infinite`;
          newLine.style.animationDelay = initialDelay;
        } else {
          // Começar nas laterais (fora da tela)
          if (goingRight) {
            newLine.style.left = '-100%';
            newLine.style.animation = `code-scroll-right ${15 + Math.random() * 20}s linear infinite`;
          } else {
            newLine.style.left = '100%';
            newLine.style.animation = `code-scroll-left ${15 + Math.random() * 20}s linear infinite`;
          }
        }
        
        container.appendChild(newLine);
      }
      
      // Limpar algumas linhas aleatoriamente para evitar acúmulo
      if (container.childNodes.length > 70) {
        const randomIndex = Math.floor(Math.random() * container.childNodes.length);
        if (container.childNodes[randomIndex]) {
          container.removeChild(container.childNodes[randomIndex]);
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return (
    <div className="code-background" ref={containerRef}>
      {/* As linhas de código serão injetadas aqui */}
    </div>
  );
};

export default CodeAnimation;