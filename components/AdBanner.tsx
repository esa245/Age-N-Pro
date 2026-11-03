'use client';

import React, { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export const AdBanner: React.FC = () => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center w-full my-2 overflow-hidden">
        <div className="w-[320px] h-[50px] rounded-lg bg-white/5" />
      </div>
    );
  }

  const adHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;background:transparent;}</style></head><body><script type="text/javascript">atOptions={'key':'9934f5085708b0a64c7e0bb81a412c39','format':'iframe','height':50,'width':320,'params':{}};</script><script type="text/javascript" src="https://www.highrevenueformat.com/9934f5085708b0a64c7e0bb81a412c39/invoke.js"></script></body></html>`;

  return (
    <div className="flex justify-center items-center w-full my-2 overflow-hidden">
      <iframe
        title="Advertisement"
        srcDoc={adHtml}
        width="320"
        height="50"
        scrolling="no"
        className="border-0 overflow-hidden rounded-lg bg-transparent max-w-full"
      />
    </div>
  );
};

export default AdBanner;
