import React from 'react';
import { Link } from 'react-router-dom';
import { Challenge, ChallengeType } from '../types';
import { RunningIcon, CyclingIcon, BodyweightIcon, DumbbellIcon, UsersIcon, AbsIcon } from './icons/Icons';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ICONS: { [key in ChallengeType]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  [ChallengeType.CAMINHADA]: RunningIcon,
  [ChallengeType.CICLISMO]: CyclingIcon,
  [ChallengeType.FLEXOES]: BodyweightIcon,
  [ChallengeType.ABDOMINAIS]: AbsIcon,
  [ChallengeType.ACADEMIA]: DumbbellIcon,
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const Icon = ICONS[challenge.type] || DumbbellIcon;
  const isFull = challenge.participantsCount >= challenge.vacancies;

  return (
    <Link to={`/desafio/${challenge.id}`} className="block transition-transform duration-300 hover:scale-[1.03] active:scale-100">
      <div className="bg-glass rounded-2xl shadow-lg shadow-glow-purple/10 overflow-hidden border border-white/10">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center text-primary">
              <Icon className="h-6 w-6 mr-3 drop-shadow-[0_0_5px_rgba(122,0,255,0.8)]" />
              <div>
                <h3 className="text-xl font-bold text-text">{challenge.title}</h3>
                <span className="text-sm font-semibold uppercase tracking-wider text-text-secondary">{challenge.type}</span>
              </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-gradient-blue-purple">R${(challenge.entryValue / 100).toFixed(2)}</p>
                <p className="text-xs text-text-secondary -mt-1">Entrada</p>
            </div>
          </div>
          
          <p className="text-text-secondary text-sm mb-5">{challenge.description}</p>
          
          <div className="flex justify-between items-center text-sm text-text-secondary">
             <div className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-1.5" />
                <span>{challenge.participantsCount} / {challenge.vacancies}</span>
            </div>
            {isFull ? (
                <span className="px-3 py-1 text-xs font-bold text-danger bg-danger/20 rounded-full shadow-[0_0_8px_rgba(255,77,77,0.5)]">LOTADO</span>
            ) : (
                <span className="px-3 py-1 text-xs font-bold text-accent bg-accent/20 rounded-full animate-pulse-glow shadow-[0_0_8px_rgba(0,255,178,0.5)]">ABERTO</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChallengeCard;