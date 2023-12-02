import type { Metadata } from 'next';

import app from '@/config/app';

import { GenerateMetadataOptions } from './types';

const generateMetadata = (metadata?: Partial<Metadata>, options?: GenerateMetadataOptions): Metadata => {
  let title = metadata?.title ?? app.name;
  const description = metadata?.description ?? app.description;

  if (options?.withSuffix) {
    title += ` | ${app.name}`;
  }

  const metadataResult: Metadata = {
    ...metadata,
    title,
    description,
    keywords: metadata?.keywords ?? app.keywords,
    applicationName: app.name,
    metadataBase: metadata?.metadataBase ?? new URL('http://localhost:3000'),
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: app.name
    }
  };

  return metadataResult;
};

export default generateMetadata;
