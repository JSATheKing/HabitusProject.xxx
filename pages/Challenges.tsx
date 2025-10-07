
import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/ChallengeCard';
import { api } from '../services/api';
import { Challenge, ChallengeType } from '../types';

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ChallengeType | 'todos'>('todos');

  useEffect(() => {
    setLoading(true);
    api.getChallenges().then(data => {
      setChallenges(data);
      setLoading(false);
    });
  }, []);

  const filteredChallenges = challenges.filter(c => filter === 'todos' || c.type === filter);
  
  const filterOptions: {value: ChallengeType | 'todos', label: string}[] = [
      {value: 'todos', label: 'Todos'},
      {value: ChallengeType.CAMINHADA, label: 'Caminhada'},
      {value: ChallengeType.CICLISMO, label: 'Ciclismo'},
      {value: ChallengeType.FLEXOES, label: 'Flexões'},
      {value: ChallengeType.ACADEMIA, label: 'Academia'},
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Encontre seu Desafio</h1>
      
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
            {filterOptions.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                        filter === opt.value
                        ? 'bg-primary text-white'
                        : 'bg-surface text-text-secondary hover:bg-gray-700'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-text-secondary">Carregando desafios...</p>
      ) : (
        <div className="space-y-4">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          ) : (
            <p className="text-center text-text-secondary">Nenhum desafio encontrado com este filtro.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Challenges;
