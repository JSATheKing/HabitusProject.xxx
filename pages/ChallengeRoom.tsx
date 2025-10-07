import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Challenge } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getPatentInfo } from '../utils/patents';
import { CheckCircleIcon, VideoCameraIcon, XCircleIcon, TrophyIcon } from '../components/icons/Icons';

type Participant = { id: string, name: string, xp: number, progress: number };
type ChallengeRoomData = { challenge: Challenge, participants: Participant[] };

const CircularProgress: React.FC<{ progress: number, size: number, strokeWidth: number }> = ({ progress, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs><linearGradient id="circleGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#7A00FF"/><stop offset="100%" stopColor="#00C4FF"/></linearGradient></defs>
      <circle className="text-white/10" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
      <circle stroke="url(#circleGrad)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={size/2} cy={size/2} style={{transition:'stroke-dashoffset .5s ease'}}/>
    </svg>
  );
};

const ChallengeRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<ChallengeRoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prizePool, setPrizePool] = useState(0);
  
  useEffect(() => {
    if (id) {
      api.getChallengeRoomData(id).then(result => {
        setData(result);
        setLoading(false);
      });
    }
  }, [id]);

  const totalPrize = useMemo(() => {
    if (!data) return 0;
    return data.challenge.entryValue * data.challenge.participantsCount;
  }, [data]);

  useEffect(() => {
    if (totalPrize > 0) {
      const duration = 1500;
      const startTime = Date.now();
      const frame = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setPrizePool(Math.floor(progress * totalPrize));
        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      };
      requestAnimationFrame(frame);
    }
  }, [totalPrize]);

  const currentUserData = data?.participants.find(p => p.id === user?.id);
  const { currentPatent } = getPatentInfo(currentUserData?.xp || 0);

  if (loading) return <div className="text-center p-8">Carregando sala do desafio...</div>;
  if (!data) return <div className="text-center p-8 text-danger">Desafio não encontrado.</div>;

  const { challenge, participants } = data;
  const challengeProgress = (2 / challenge.rules.days) * 100; // Example: Day 2 of 5

  const patentColors: { [key: string]: string } = {
    'Conscrito da Disciplina': 'text-gray-400',
    'Soldado da Disciplina': 'text-green-400',
    'Cabo da Disciplina': 'text-blue-400',
    'Sargento da Disciplina': 'text-purple-400',
    'Tenente da Disciplina': 'text-indigo-400',
    'Capitão da Disciplina': 'text-yellow-400',
    'Major da Disciplina': 'text-red-400',
    'Coronel da Disciplina': 'text-gray-200',
    'General da Disciplina': 'text-yellow-300 shine-effect',
    'Presidente da Disciplina': 'text-white animate-pulse-glow',
  };

  return (
    <div className="-mx-4 -mt-8 animate-fade-in-up">
      {/* Header */}
      <header className="p-4 rounded-b-3xl bg-gradient-to-br from-primary to-secondary shadow-lg">
        <h1 className="text-2xl font-bold text-center">🏃‍♂️ {challenge.title}</h1>
        <div className="mt-3">
          <p className="text-center text-sm font-semibold mb-1">Dia 2 de {challenge.rules.days}</p>
          <div className="w-full bg-white/20 rounded-full h-4">
            <div className="bg-white rounded-full h-4" style={{ width: `${challengeProgress}%` }}></div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Financial Status */}
        <section className="bg-gradient-to-r from-primary/50 to-secondary/50 p-4 rounded-2xl text-center shadow-glow-blue/20">
          <h2 className="font-bold text-lg">💰 Valor em Jogo</h2>
          <p className="text-4xl font-black my-1">R$ {(prizePool / 100).toFixed(2)}</p>
          <p className="text-xs text-text-secondary">O valor cresce conforme novos competidores entram!</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Progress */}
          <section className="bg-gradient-container p-6 rounded-2xl shadow-glow-dual flex flex-col items-center">
            <h2 className="font-bold text-lg text-center">Seu Progresso</h2>
            <div className="flex-grow flex flex-col items-center justify-center my-4">
              <div className="relative w-28 h-28">
                <CircularProgress progress={currentUserData?.progress || 0} size={112} strokeWidth={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <currentPatent.Icon className="w-8 h-8" />
                   <span className="text-xl font-bold mt-1">{(currentUserData?.progress || 0)}%</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-4">Faltam <strong>{challenge.rules.days - 2} dias</strong> para completar.</p>
            </div>
            <p className="font-bold text-base text-secondary">Você está em 3º lugar no ranking!</p>
          </section>

          {/* Rules */}
          <section className="bg-glass p-4 rounded-2xl border border-white/10">
            <h2 className="font-bold text-lg mb-3">📜 Regras e Funcionamento</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start"><CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-accent flex-shrink-0" /><span>Caminhe 5 km por dia durante 5 dias.</span></li>
              <li className="flex items-start"><VideoCameraIcon className="w-5 h-5 mr-2 mt-0.5 text-secondary flex-shrink-0" /><span>Envie vídeo de check-in e check-out diário.</span></li>
              <li className="flex items-start"><XCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-danger flex-shrink-0" /><span>Fraudes desclassificam automaticamente.</span></li>
              <li className="flex items-start"><TrophyIcon className="w-5 h-5 mr-2 mt-0.5 text-yellow-400 flex-shrink-0" /><span>Cumpriu tudo? Recebe o prêmio em conta!</span></li>
            </ul>
          </section>
        </div>

        {/* Competitors List */}
        <section>
          <h2 className="text-xl font-bold mb-3">🏆 Tabela de Competidores</h2>
          <div className="bg-[#0C0C12] rounded-xl shadow-lg border border-white/10 overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-12 bg-gradient-to-r from-primary/50 to-secondary/50 text-xs uppercase font-semibold">
              <div className="p-3 col-span-1 text-center">Pos.</div>
              <div className="p-3 col-span-6">Competidor</div>
              <div className="p-3 col-span-5">Progresso</div>
            </div>
            {/* Participants List */}
            <div className="flex flex-col md:block">
              {participants.map((p, index) => {
                const { currentPatent } = getPatentInfo(p.xp);
                const isCurrentUser = p.id === user?.id;
                return (
                  <div key={p.id} className={`border-b border-gray-800 last:border-b-0 ${isCurrentUser ? 'bg-primary/20' : 'odd:bg-white/[0.03] even:bg-transparent'}`}>
                    {/* Mobile Card Layout */}
                    <div className="p-3 md:hidden">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-bold text-lg w-8">{index + 1}.</span>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className={`text-xs ${patentColors[currentPatent.name] || 'text-text-secondary'}`}>{currentPatent.name}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-text-secondary">{p.progress}%</span>
                      </div>
                      <div className="relative w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                    {/* Desktop Table Row Layout */}
                    <div className="hidden md:grid md:grid-cols-12 items-center p-3">
                      <div className="col-span-1 text-center font-bold">{index + 1}</div>
                      <div className="col-span-6">
                        <p className="font-semibold">{p.name}</p>
                        <p className={`text-xs ${patentColors[currentPatent.name] || 'text-text-secondary'}`}>{currentPatent.name}</p>
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                          <div className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold w-10 text-right flex-shrink-0">{p.progress}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="pt-6">
            <button 
              onClick={() => navigate(`/gravar/p-${challenge.id}-${user?.id}/checkin`)}
              className="w-full h-14 flex items-center justify-center rounded-xl text-white font-extrabold text-lg bg-gradient-to-r from-primary to-secondary shadow-lg shadow-glow-purple/40 hover:scale-[1.02] active:scale-100 transition-transform"
            >
              <VideoCameraIcon className="w-6 h-6 mr-3" />
              Enviar Check-in / Check-out
            </button>
            <button className="w-full text-center text-danger text-sm mt-3 hover:underline">Sair do Desafio</button>
        </section>
      </main>
    </div>
  );
};

export default ChallengeRoom;