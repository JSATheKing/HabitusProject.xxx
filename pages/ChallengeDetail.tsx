import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Challenge } from '../types';
import { 
    CashIcon, UsersIcon, ClockIcon, CalendarIcon, RunningIcon, 
    VideoCameraIcon, ShieldCheckIcon, LightningIcon 
} from '../components/icons/Icons';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getChallengeById(id).then(data => {
        setChallenge(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  const handleJoin = () => {
    if (!challenge) return;
    // Navigate to the new Challenge Room screen
    navigate(`/sala-desafio/${challenge.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-text-secondary">Carregando detalhes do desafio...</p>
      </div>
    );
  }

  if (!challenge) {
    return <div className="text-center text-red-500">Desafio não encontrado.</div>;
  }

  const isRegistrationOver = new Date() > challenge.registrationEnd;
  const isFull = challenge.participantsCount >= challenge.vacancies;

  let buttonState: 'available' | 'full' | 'closed' = 'available';
  if (isRegistrationOver) buttonState = 'closed';
  else if (isFull) buttonState = 'full';

  const buttonContent = {
    available: { text: "Participar do Desafio", icon: <LightningIcon className="w-6 h-6 mr-2" />, className: "bg-gradient-to-r from-primary to-secondary hover:shadow-glow-blue/50", disabled: false },
    full: { text: "Desafio Lotado", icon: null, className: "bg-gray-700 cursor-not-allowed", disabled: true },
    closed: { text: "Inscrições Encerradas", icon: null, className: "bg-gray-800 cursor-not-allowed", disabled: true },
  };

  const currentButton = buttonContent[buttonState];

  const rules = [
    { icon: CalendarIcon, text: `Duração: ${challenge.rules.days} dias.`, color: 'text-secondary' },
    challenge.rules.distance && { icon: RunningIcon, text: `Meta diária: ${challenge.rules.distance} km de caminhada.`, color: 'text-secondary' },
    { icon: VideoCameraIcon, text: 'Check-in e check-out com vídeo obrigatório.', color: 'text-primary' },
    { icon: ShieldCheckIcon, text: 'Verificação anti-fraude aplicada.', color: 'text-accent' }
  ].filter(Boolean) as { icon: React.FC<any>, text: string, color: string }[];
  
  return (
    <div className="-mx-4 -mt-8">
      <div className="animate-fade-in-up" style={{ animationDuration: '0.6s' }}>
        {/* Banner */}
        <header 
          className="h-64 md:h-80 bg-cover bg-center relative flex items-end p-4 md:p-6" 
          style={{ backgroundImage: `url(https://picsum.photos/seed/${challenge.id}/1200/800)` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 text-white">
            <h1 className="text-3xl md:text-4xl font-black text-gradient-white-blue">{challenge.title}</h1>
            <p className="mt-1 text-base md:text-lg text-gray-300 max-w-lg">{challenge.description}</p>
          </div>
        </header>
        
        <main className="p-4 space-y-6">
            {/* Info Bar */}
            <section className="bg-gradient-to-r from-[#0A0A12] to-[#141426] rounded-2xl p-4 shadow-lg shadow-secondary/10 border border-white/5">
                <div className="grid grid-cols-3 divide-x divide-[#242442]">
                    <div className="flex flex-col items-center justify-center text-center px-2">
                        <CashIcon className="w-7 h-7 mb-1.5 text-primary animate-subtle-pulse"/>
                        <p className="text-lg font-bold text-primary">R${(challenge.entryValue / 100).toFixed(2)}</p>
                        <p className="text-xs text-text-secondary">Entrada</p>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-2">
                        <UsersIcon className="w-7 h-7 mb-1.5 text-secondary animate-subtle-pulse" style={{ animationDelay: '0.5s' }}/>
                        <p className="text-lg font-bold text-secondary">{challenge.participantsCount}/{challenge.vacancies}</p>
                        <p className="text-xs text-text-secondary">Vagas</p>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-2">
                        <ClockIcon className="w-7 h-7 mb-1.5 text-text-secondary animate-subtle-pulse" style={{ animationDelay: '1s' }}/>
                        <p className="text-lg font-bold text-text-secondary">{challenge.rules.days} Dias</p>
                        <p className="text-xs text-text-secondary">Duração</p>
                    </div>
                </div>
            </section>

            {/* Rules */}
            <section>
                <h2 className="text-xl font-extrabold text-white mb-4">Regras do Desafio</h2>
                <div className="space-y-3">
                    {rules.map((rule, index) => (
                        <div key={index} className="flex items-center bg-[#1A1A2C] p-3 rounded-lg border border-[#262648]">
                            <rule.icon className={`w-6 h-6 mr-4 flex-shrink-0 ${rule.color}`} />
                            <p className="text-sm text-gray-300">{rule.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Period */}
            <section>
                <div className="p-4 rounded-lg bg-gradient-to-tr from-secondary/10 to-primary/10 border border-white/10">
                    <div className="flex items-center mb-2">
                        <CalendarIcon className="w-6 h-6 mr-3 text-text-secondary"/>
                        <h2 className="text-xl font-extrabold text-white">Período</h2>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1 pl-9">
                        <p><strong>Inscrições até:</strong> {new Date(challenge.registrationEnd).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Execução:</strong> {new Date(challenge.startDate).toLocaleDateString('pt-BR')} a {new Date(challenge.endDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            </section>
            
            {/* Action Button */}
            <div className="pt-4 pb-16"> {/* Add padding bottom to avoid overlap with nav */}
              <button
                onClick={handleJoin}
                disabled={currentButton.disabled}
                className={`w-full h-14 flex items-center justify-center rounded-xl text-white font-extrabold text-lg transition-all duration-300 shadow-lg ${currentButton.className} hover:scale-[1.02] active:scale-100`}
              >
                {currentButton.icon}
                {currentButton.text}
              </button>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ChallengeDetail;
