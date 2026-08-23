import { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadMeeting } from '../api/meetings';

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const acceptedTypes = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac'];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  }, []);

  const validateAndSetFile = (f: File) => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(ext)) {
      setError(`Unsupported format "${ext}". Upload an mp3, wav, or m4a file.`);
      return;
    }
    setFile(f);
    // Auto-generate title from filename if empty
    if (!title) {
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (!title.trim()) {
      setError('Give your meeting a title.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadMeeting(file, title.trim());
      navigate(`/app/meetings/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        id="upload-dropzone"
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                    transition-all duration-200 ease-out
                    ${isDragging
                      ? 'border-ledger-green bg-ledger-green/5 scale-[1.02]'
                      : file
                        ? 'border-ledger-green/40 bg-ledger-green/3'
                        : 'border-hairline hover:border-slate/40 hover:bg-paper-dark/50'
                    }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />

        {file ? (
          <div className="animate-fade-rise">
            <div className="w-12 h-12 rounded-full bg-ledger-green/10 mx-auto mb-4 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ledger-green">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <p className="font-body font-medium text-ink mb-1">{file.name}</p>
            <p className="text-sm text-slate">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
              <span className="mx-2 text-hairline">·</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-seal-amber hover:text-seal-amber/80 underline font-medium"
              >
                Remove
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-paper-dark mx-auto mb-5 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate">
                <path d="M12 15V3m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-body font-medium text-ink mb-1">
              Drop your audio file here
            </p>
            <p className="text-sm text-slate">
              or click to browse — mp3, wav, m4a accepted
            </p>
          </>
        )}
      </div>

      {/* Title input */}
      <div className="mt-6">
        <label htmlFor="meeting-title" className="block text-sm font-medium text-ink mb-2">
          Meeting title
        </label>
        <input
          id="meeting-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Team Standup — Aug 14"
          className="w-full px-4 py-3 rounded-xl border border-hairline bg-paper
                     font-body text-ink placeholder:text-slate/50
                     focus:outline-none focus:ring-2 focus:ring-ledger-green focus:border-transparent
                     transition-shadow duration-150"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-body animate-fade-rise">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!file || !title.trim() || uploading}
        id="upload-submit"
        className="mt-6 w-full py-3.5 rounded-xl font-body font-semibold text-sm
                   transition-all duration-200 ease-out
                   disabled:opacity-40 disabled:cursor-not-allowed
                   bg-ink text-paper hover:bg-ink/90 active:scale-[0.98]"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
            </svg>
            Uploading…
          </span>
        ) : (
          'Upload and transcribe'
        )}
      </button>
    </div>
  );
}
