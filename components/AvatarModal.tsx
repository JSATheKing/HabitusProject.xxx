import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadIcon, CameraIcon, TrashIcon, XCircleIcon } from './icons/Icons';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageDataUrl: string) => void;
  currentAvatar: string;
}

const AvatarModal: React.FC<AvatarModalProps> = ({ isOpen, onClose, onSave, currentAvatar }) => {
  const [view, setView] = useState<'options' | 'preview' | 'camera'>('options');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setView('options');
        setPreviewImage(null);
        setError(null);
        setIsLoading(false);
        cleanupCamera();
      }, 300); // Delay to allow for closing animation
    }
  }, [isOpen, cleanupCamera]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Formato inválido. Use JPG ou PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('A imagem é muito grande. Máximo de 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setView('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCamera = async () => {
    setError(null);
    if (streamRef.current) cleanupCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setView('camera');
    } catch (err) {
      console.error(err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };
  
  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewImage(dataUrl);
    setView('preview');
    cleanupCamera();
  };
  
  const handleRemove = () => {
    // Revert to a default or the original Pravatar image
    onSave(`https://i.pravatar.cc/150?u=default`);
  };

  const handleSave = async () => {
    if (!previewImage) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    setIsLoading(false);
    onSave(previewImage);
  };

  if (!isOpen) return null;

  const OptionButton: React.FC<{ icon: React.FC<any>, label: string, onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <Icon className="w-6 h-6 mr-4 text-secondary"/>
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
      <div className="bg-gradient-to-br from-[#0C0C12] to-[#1A1A24] rounded-2xl w-full max-w-sm m-4 border border-white/10 shadow-glow-purple/20">
        <header className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="font-bold text-lg">Atualizar Foto de Perfil</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white"><XCircleIcon className="w-7 h-7"/></button>
        </header>
        
        <main className="p-6">
          {error && <div className="p-3 mb-4 text-sm text-center bg-red-900/50 text-red-300 border border-red-500/50 rounded-lg">{error}</div>}

          {view === 'options' && (
            <div className="space-y-3">
              <OptionButton icon={UploadIcon} label="Enviar Foto" onClick={() => fileInputRef.current?.click()} />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
              <OptionButton icon={CameraIcon} label="Tirar Foto Agora" onClick={handleOpenCamera} />
              <OptionButton icon={TrashIcon} label="Remover Foto Atual" onClick={handleRemove} />
            </div>
          )}

          {view === 'preview' && previewImage && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-text-secondary mb-3">Pré-visualização</p>
              <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary">
                 <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex w-full space-x-3 mt-6">
                <button onClick={() => setView('options')} className="w-full py-3 rounded-lg bg-white/10 font-semibold hover:bg-white/20">Voltar</button>
                <button onClick={handleSave} disabled={isLoading} className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary font-bold text-white hover:shadow-glow-blue/50 disabled:opacity-50">
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}
          
          {view === 'camera' && (
             <div className="flex flex-col items-center">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-black mb-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                </div>
                <div className="flex w-full space-x-3">
                  <button onClick={() => { cleanupCamera(); setView('options'); }} className="w-full py-3 rounded-lg bg-white/10 font-semibold hover:bg-white/20">Cancelar</button>
                  <button onClick={handleCapture} className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary font-bold text-white hover:shadow-glow-blue/50">Capturar</button>
                </div>
             </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AvatarModal;
