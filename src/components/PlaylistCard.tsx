'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Play, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export type Track = {
  id: string;
  name: string;
  artist: string;
  album?: string;
  previewUrl?: string | null;
};

type Props = {
  imagePreviewUrl: string;
  mood: string;
  description: string;
  tracks: Track[];
  onPlay?: () => void;
  onShareAsImage?: (blob: Blob) => void;
  saved?: boolean;
  onSave?: () => void;
  canSave?: boolean;
};

export function PlaylistCard({
  imagePreviewUrl,
  mood,
  description,
  tracks,
  onPlay,
  onShareAsImage,
  saved,
  onSave,
  canSave,
}: Props) {
  const t = useTranslations('playlist');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShareAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#18181b',
        scale: 2,
      });
      canvas.toBlob((blob) => {
        if (blob && onShareAsImage) onShareAsImage(blob);
        else if (blob && typeof navigator !== 'undefined' && navigator.share) {
          const file = new File([blob], 'playlist.png', { type: 'image/png' });
          navigator.share({ files: [file], title: 'Playlist' });
        }
      }, 'image/png');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div
        ref={cardRef}
        className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 p-6"
      >
        <div className="flex gap-4 mb-4">
          <img
            src={imagePreviewUrl}
            alt=""
            className="w-28 h-28 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-amber-400 text-sm font-medium">{mood}</p>
            <h2 className="text-lg font-semibold mt-1">{t('title')}</h2>
            <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{description}</p>
          </div>
        </div>
        <ul className="space-y-2">
          {tracks.slice(0, 8).map((track, i) => (
            <li key={track.id} className="flex items-center gap-3 text-sm">
              <span className="text-zinc-500 w-6">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{track.name}</p>
                <p className="text-zinc-400 truncate">{track.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {onPlay && (
          <button
            type="button"
            onClick={onPlay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-900 font-medium"
          >
            <Play className="w-4 h-4" />
            {t('play')}
          </button>
        )}
        <button
          type="button"
          onClick={handleShareAsImage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        >
          <Share2 className="w-4 h-4" />
          {t('shareAsImage')}
        </button>
        {canSave && onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {saved ? t('saved') : t('save')}
          </button>
        )}
      </div>
    </div>
  );
}
