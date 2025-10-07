import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ChallengeCard from '../components/ChallengeCard';
import { api } from '../services/api';
import { Challenge } from '../types';
import { getPatentInfo, patentTiers } from '../utils/patents';


const ProgressRing: React.FC<{ progress: number; size: number; strokeWidth: number }> = ({ progress, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7A00FF" />
          <stop offset="100%" stopColor="#1E90FF" />
        </linearGradient>
      </defs>
      <circle
        className="text-white/10"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />
    </svg>
  );
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const [featuredChallenges, setFeaturedChallenges] = useState<Challenge[]>([]);
  const [rankingTab, setRankingTab] = useState<'nacional' | 'estadual'>('nacional');
  const [leveledUp, setLeveledUp] = useState(false);

  const patentInfo = useMemo(() => getPatentInfo(user?.xp || 0), [user?.xp]);
  const prevPatentName = useRef(patentInfo.currentPatent.name);

  useEffect(() => {
    if (prevPatentName.current !== patentInfo.currentPatent.name && prevPatentName.current !== patentTiers[0].name) {
      setLeveledUp(true);
      prevPatentName.current = patentInfo.currentPatent.name;
      setTimeout(() => setLeveledUp(false), 3000); // Animation duration
    }
  }, [patentInfo.currentPatent.name]);

  useEffect(() => {
    api.getChallenges().then(allChallenges => {
      setFeaturedChallenges(allChallenges.slice(0, 2));
    });
  }, []);

  const nationalRanking = [
    { rank: 1, name: 'João P.', xp: 15430, icon: '🥇' },
    { rank: 2, name: 'Maria C.', xp: 14980, icon: '🥈' },
    { rank: 3, name: 'Carlos S.', xp: 13210, icon: '🥉' },
  ];

  const stateRanking = [
    { rank: 1, name: 'Ana B.', xp: 9800, icon: '🥇' },
    { rank: 2, name: 'Pedro L.', xp: 9550, icon: '🥈' },
    { rank: 3, name: 'Sofia M.', xp: 9200, icon: '🥉' },
  ];
  
  const userNationalRank = { rank: 15, name: user?.name || '', xp: user?.xp || 0 };
  const userStateRank = { rank: 4, name: user?.name || '', xp: user?.xp || 0 };

  const currentRanking = rankingTab === 'nacional' ? nationalRanking : stateRanking;
  const currentUserRank = rankingTab === 'nacional' ? userNationalRank : userStateRank;
  
  const userXPProgress = ((user?.xp || 0) % 1000) / 10; // Example progress logic

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header & Profile */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">Olá, {user?.name.split(' ')[0]}!</h1>
          <p className="text-text-secondary mt-1">Continue sua jornada.</p>
        </div>
        <div className="relative">
            <ProgressRing progress={userXPProgress} size={72} strokeWidth={6} />
            <img 
                src={`https://i.pravatar.cc/150?u=${user?.id}`} 
                alt="Avatar" 
                className="w-14 h-14 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-bg-end"
            />
        </div>
      </header>
      
      {/* Painel de Patente */}
      <div className={`relative p-0.5 bg-gradient-to-br from-primary to-secondary rounded-3xl transition-transform duration-500 hover:shadow-glow-blue/50 bg-[size:200%_auto] ${leveledUp ? 'animate-level-up-glow' : ''}`}>
        <div className="bg-gradient-container p-5 rounded-[22px] shadow-glow-dual flex items-center space-x-5 relative overflow-hidden">
            
            {leveledUp && (
              <div className="absolute inset-0 flex items-center justify-center animate-fade-in-out z-10">
                  <p className="text-2xl font-black text-gradient-purple-blue drop-shadow-[0_0_10px_#fff]" style={{ textShadow: '0 0 10px rgba(255,255,255,0.7)' }}>Nova Patente Alcançada!</p>
              </div>
            )}

            {/* Insignia */}
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <patentInfo.currentPatent.Icon className="w-full h-full" />
            </div>

            {/* Info */}
            <div className="flex-grow space-y-2">
                <h2 className="text-2xl font-black text-gradient-purple-blue" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
                  {patentInfo.currentPatent.name}
                </h2>
                <p className="font-extrabold text-secondary text-lg animate-subtle-pulse">
                  {(user?.xp || 0).toLocaleString('pt-BR')} XP
                </p>
                
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-end">
                      <p className="text-xs text-text-secondary">
                        {patentInfo.xpToNext > 0 
                        ? `Faltam ${patentInfo.xpToNext.toLocaleString('pt-BR')} XP para ${patentInfo.nextPatent?.name || 'próximo nível'}` 
                        : 'Patente Máxima Alcançada!'}
                      </p>
                      <span className="text-xs font-bold text-white">{Math.floor(patentInfo.progressPercentage)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#23233A] rounded-full overflow-hidden">
                      <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shine-effect"
                          style={{ width: `${patentInfo.progressPercentage}%`, transition: 'width 1.2s ease-out' }}
                      ></div>
                  </div>
                </div>
            </div>
        </div>
      </div>

      {/* Ranking Section */}
      <section>
        <div className="flex mb-4 border-b border-white/10">
            <button onClick={() => setRankingTab('nacional')} className={`px-4 py-2 font-semibold transition-colors ${rankingTab === 'nacional' ? 'text-secondary border-b-2 border-secondary' : 'text-text-secondary'}`}>Nacional</button>
            <button onClick={() => setRankingTab('estadual')} className={`px-4 py-2 font-semibold transition-colors ${rankingTab === 'estadual' ? 'text-secondary border-b-2 border-secondary' : 'text-text-secondary'}`}>Estadual ({user?.state})</button>
        </div>
        <div className="bg-glass border border-white/10 p-4 rounded-2xl space-y-3">
          {currentRanking.map(player => (
            <div key={player.rank} className="flex justify-between items-center p-2 rounded-lg">
                <span className="font-semibold">{player.rank}. {player.icon} {player.name}</span> 
                <span className="font-bold text-text-secondary">{player.xp.toLocaleString()} XP</span>
            </div>
          ))}
          <div className="border-t border-white/10 my-2"></div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-primary/20 border border-primary/50 ring-1 ring-primary/50 shadow-glow-purple">
            <span className="font-bold text-secondary">{currentUserRank.rank}. {currentUserRank.name}</span> 
            <span className="font-bold text-secondary">{currentUserRank.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </section>

      {/* Desafios Abertos */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Desafios em Destaque</h2>
        <div className="space-y-6">
          {featuredChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>
      
      {/* Ver Todos Button */}
      <Link 
        to="/desafios" 
        className="block w-full text-center mt-4 bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-4 rounded-full transition-all duration-300 shadow-lg shadow-glow-purple/30 hover:shadow-glow-blue/50 hover:scale-105 active:scale-95"
      >
        Ver Todos Desafios
      </Link>
    </div>
  );
};

export default Home;