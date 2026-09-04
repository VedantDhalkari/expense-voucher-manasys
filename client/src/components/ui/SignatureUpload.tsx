import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface SignatureUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  error?: string;
}

export const SignatureUpload: React.FC<SignatureUploadProps> = ({ onFileSelect, selectedFile, error }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFile = (file: File) => {
    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      onFileSelect(file);
    } else {
      alert('Only PNG or JPEG images are allowed.');
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-[13px] font-semibold text-brand-slate block">Signature Image</label>
      
      {!selectedFile ? (
        <div
          className={cn(
            "min-h-[140px] border-2 border-dashed rounded-[6px] bg-brand-surface flex flex-col items-center justify-center transition-colors cursor-pointer",
            isDragging ? "border-brand-action bg-blue-50/50" : "border-brand-borderAccent hover:bg-slate-50",
            error && "border-status-rejected-solid"
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <UploadCloud className="w-8 h-8 text-brand-slate mb-2" />
          <p className="text-sm font-medium text-brand-navy">Click or drag image to upload</p>
          <p className="text-xs text-slate-500 mt-1">PNG or JPEG up to 2MB</p>
        </div>
      ) : (
        <div className="h-[140px] border border-brand-borderAccent rounded-[6px] bg-white p-4 flex items-center gap-4">
          <div className="w-24 h-24 rounded-md border border-brand-border overflow-hidden bg-slate-50 shrink-0">
            {preview && <img src={preview} alt="Signature preview" className="w-full h-full object-contain" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-navy truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onFileSelect(null)} type="button">
            <X className="w-4 h-4 mr-1" /> Remove
          </Button>
        </div>
      )}
      
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      {error && <p className="text-xs text-status-rejected-solid">{error}</p>}
    </div>
  );
};
