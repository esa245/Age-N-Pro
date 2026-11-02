import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const logoUrl = 'https://res.cloudinary.com/dlklqihg6/image/upload/v1793605832/naydn7myt42abjuizhmm.png';
  
  return {
    id: '/',
    name: 'Family Age & Lifespan Calculator',
    short_name: 'FamilyAge',
    description: 'Calculate family members age and lifespan with offline support.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#00f2fe',
    icons: [
      {
        src: logoUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
