import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageAsset } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageAsset) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPEG, WebP).');
      return;
    }
    
    // Gemini has a payload size limit. For client-side simplicity, we'll check rudimentary size.
    // Ideally we resize on client side if too large, but for now we just warn.
    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Please use an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected({
          id: crypto.randomUUID(),
          data: e.target.result as string,
          mimeType: file.type
        });
        setError(null);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative group cursor-pointer flex flex-col items-center justify-center w-full h-80 rounded-3xl border-3 border-dashed transition-all duration-300 ease-out 
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
            : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-8">
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
            <Upload className="w-10 h-10" />
          </div>
          <p className="mb-2 text-xl font-semibold text-slate-700">
            Click or drag image to upload
          </p>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Support for PNG, JPG and WebP. Max 5MB.
          </p>
        </div>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept="image/*"
          onChange={handleFileInput}
        />
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};