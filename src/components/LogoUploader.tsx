import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploaderProps {
  logoUrl?: string;
  onChange: (url?: string) => void;
  label?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  logoUrl,
  onChange,
  label = 'Business / Brand Logo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </span>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/svg+xml, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {logoUrl ? (
        <div className="relative group inline-block border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-800 shadow-xs">
          <img
            src={logoUrl}
            alt="Uploaded brand logo"
            className="h-12 w-auto max-w-[140px] object-contain rounded"
          />
          <button
            type="button"
            onClick={handleRemove}
            title="Remove logo"
            className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-md transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span>Upload Logo (PNG, SVG, JPG)</span>
          <Upload className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  );
};
