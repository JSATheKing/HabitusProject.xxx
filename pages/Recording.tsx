import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Recording: React.FC = () => {
  const { participationId, checkType } = useParams<{ participationId: string; checkType: 'checkin' | 'checkout' }>();
  const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'requesting' | 'ready' | 'recording' | 'uploading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(3);
  const [time, setTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (participationId && checkType) {
      api.generateKeyword(participationId, checkType).then(setKeyword);
    }
  }, [participationId, checkType]);

  const startCamera = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus('ready');
    } catch (err) {
      console.error("Erro ao acessar a câmera: ", err);
      setError('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
      setStatus('error');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    let counter = 3;
    setCountdown(counter);
    const countdownInterval = setInterval(() => {
        counter -= 1;
        setCountdown(counter);
        if (counter === 0) {
            clearInterval(countdownInterval);
            
            setStatus('recording');
            recordedChunksRef.current = [];
            
            const options = { mimeType: 'video/webm; codecs=vp9' };
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.start();
            setTime(0);
            
            const timerInterval = setInterval(() => setTime(t => t + 1), 1000);

            setTimeout(() => {
                stopRecording();
                clearInterval(timerInterval);
            }, 10000); // Max recording time 10s
        }
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setStatus('uploading');
        handleUpload();
    }
  };
  
  const handleUpload = async () => {
    const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    if (!participationId || !checkType) return;
    try {
        const result = await api.uploadVideo(participationId, checkType, videoBlob);
        console.log("Upload result:", result);
        setStatus('done');
        
        // Clean up camera stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setTimeout(() => {
            if (checkType === 'checkin') {
                navigate(`/tracking/${participationId}`);
            } else {
                navigate(`/desafio/${participationId}`); // Should go to participation detail page
            }
        }, 2000);

    } catch (uploadError) {
        console.error("Upload failed", uploadError);
        setError("Falha no upload do vídeo. Tente novamente.");
        setStatus('error');
    }
  }

  useEffect(() => {
      startCamera();
      return () => {
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
          }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => {
    if (status === 'error') return <div className="text-center text-red-400 p-4">{error}</div>;
    if (status === 'uploading') return <div className="text-center p-4">Enviando vídeo...</div>;
    if (status === 'done') return <div className="text-center p-4 text-primary">Vídeo enviado com sucesso!</div>;
    if (countdown > 0 && status !== 'recording') return <div className="text-6xl font-bold">{countdown}</div>;
    if (status === 'recording') return <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-mono">REC {String(time).padStart(2,'0')}s</div>
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            {renderContent()}
        </div>
      </div>
      <div className="mt-6 text-center text-white w-full max-w-md px-4">
        <p className="text-lg">Fale a palavra-chave em voz alta:</p>
        <p className="text-4xl font-extrabold text-secondary my-2 tracking-wider">{keyword || 'CARREGANDO...'}</p>
        
        {status === 'ready' && (
            <button onClick={startRecording} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors shadow-lg">
                Iniciar Gravação (3-10s)
            </button>
        )}
        {status === 'recording' && (
             <button onClick={stopRecording} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors shadow-lg">
                Parar Gravação
            </button>
        )}
      </div>
    </div>
  );
};

export default Recording;