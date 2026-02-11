'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ImageUploader } from '@/components/ImageUploader';
import { PlaylistCard, type Track } from '@/components/PlaylistCard';
import { Loader2 } from 'lucide-react';

type Analysis = {
  mood: string;
  genreHints: string[];
  description: string;
};

export default function HomePage() {
  const t = useTranslations('app');
  const tUpload = useTranslations('upload');
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<'upload' | 'analyzing' | 'generating' | 'result'>('upload');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  const locale = pathname?.startsWith('/en') ? 'en' : 'ko';
  const switchLocale = () => router.push(locale === 'ko' ? '/en' : '/');

  const handleImageSelect = useCallback(async (file: File) => {
    setError(null);
    setImagePreviewUrl(URL.createObjectURL(file));
    setStep('analyzing');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = dataUrl.match(/data:([^;]+);/)?.[1] ?? 'image/jpeg';

      try {
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || res.statusText);
        }
        const data: Analysis = await res.json();
        setAnalysis(data);
        setStep('generating');

        const plRes = await fetch('/api/playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: data.mood, genreHints: data.genreHints }),
        });
        if (!plRes.ok) throw new Error('Playlist failed');
        const plData = await plRes.json();
        setTracks(plData.tracks ?? []);
        setStep('result');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
        setStep('upload');
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl('');
    setAnalysis(null);
    setTracks([]);
    setStep('upload');
    setError(null);
  }, [imagePreviewUrl]);

  return (
    <main className="min-h-screen p-6 pb-20">
      <header className="flex items-center justify-between max-w-2xl mx-auto mb-10">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{t('title')}</h1>
          <p className="text-zinc-400 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={switchLocale}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm"
          >
            {locale === 'ko' ? 'EN' : 'KO'}
          </button>
        </div>
      </header>

      {step === 'upload' && (
        <section className="max-w-xl mx-auto">
          <ImageUploader onImageSelect={handleImageSelect} />
          {error && (
            <p className="mt-4 text-center text-red-400 text-sm">{error}</p>
          )}
        </section>
      )}

      {(step === 'analyzing' || step === 'generating') && (
        <section className="max-w-xl mx-auto text-center py-16">
          {imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt=""
              className="w-40 h-40 rounded-2xl object-cover mx-auto mb-6"
            />
          )}
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-zinc-400">
            {step === 'analyzing' ? tUpload('analyzing') : tUpload('generating')}
          </p>
        </section>
      )}

      {step === 'result' && analysis && (
        <section className="space-y-6">
          <PlaylistCard
            imagePreviewUrl={imagePreviewUrl}
            mood={analysis.mood}
            description={analysis.description}
            tracks={tracks}
            onPlay={() => {}}
            onShareAsImage={(blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'playlist.png';
              a.click();
              URL.revokeObjectURL(url);
            }}
            canSave={false}
          />
          <div className="text-center">
            <button
              type="button"
              onClick={reset}
              className="text-zinc-400 hover:text-zinc-200 text-sm underline"
            >
              {locale === 'ko' ? '다른 이미지로 만들기' : 'Try another image'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
