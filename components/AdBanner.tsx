'use client';

import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script is already added to this specific container to avoid duplicates
    if (containerRef.current.querySelector('script')) return;

    const scriptConfig = document.createElement('script');
    scriptConfig.innerHTML = `
      atOptions = {
        'key' : '9934f5085708b0a64c7e0bb81a412c39',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    
    const scriptInvoke = document.createElement('script');
    scriptInvoke.src = 'https://www.highrevenueformat.com/9934f5085708b0a64c7e0bb81a412c39/invoke.js';
    scriptInvoke.async = true;

    containerRef.current.appendChild(scriptConfig);
    containerRef.current.appendChild(scriptInvoke);
  }, []);

  return (
    <div className="flex justify-center w-full my-4 overflow-hidden">
      <div 
        ref={containerRef} 
        style={{ width: '320px', height: '50px' }}
        className="bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-white/20 uppercase tracking-widest border border-white/5"
      >
        {/* Ad will be injected here */}
      </div>
    </div>
  );
}
