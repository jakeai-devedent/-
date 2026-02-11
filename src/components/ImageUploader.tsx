'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
};

export function ImageUploader({ onImageSelect, disabled }: Props) {
  const t = useTranslations('upload');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith('image/')) return;
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      if (disabled) return;
      handleFile(e.dataTransfer.files[0] ?? null);
    },
    [disabled, handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const onDragLeave = useCallback(() => setDrag(false), []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0] ?? null);
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition
          ${drag ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-600 hover:border-zinc-500'}
          ${disabled ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
        />
        <Upload className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
        <p className="text-zinc-400">{t('drag')}</p>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-60"
        >
          <Camera className="w-4 h-4" />
          <span>{t('orCamera')}</span>
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}
