import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
}

export const AvatarUpload = ({ userId, currentUrl, onUpload }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Walidacja
    if (!file.type.startsWith('image/')) {
      alert('Wybierz plik obrazu');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Zdjęcie max 2MB');
      return;
    }

    setUploading(true);

    try {
      // Podgląd lokalny
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Ścieżka: avatars/{userId}/avatar.{ext}
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;

      // Upload do Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Pobierz publiczny URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Zapisz URL w tabeli profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUpload(data.publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Błąd uploadu, spróbuj ponownie');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  // Inicjały z emaila jako fallback
  const initials = userId.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-20 h-20 rounded-full cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border-2 border-[#8B79F6]"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-[rgba(139,121,246,0.15)] border-2 border-[#8B79F6] flex items-center justify-center text-[#8B79F6] font-bold text-xl">
            {initials}
          </div>
        )}

        {/* Overlay przy hoverze */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-white text-xs">Zmień</span>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
};