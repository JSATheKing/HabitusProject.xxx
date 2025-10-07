
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { api } from '../services/api';
import { ModerationItem } from '../types';

const Moderation: React.FC = () => {
    const [queue, setQueue] = useState<ModerationItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueue();
    }, []);
    
    const fetchQueue = () => {
        setLoading(true);
        api.getModerationQueue().then(data => {
            setQueue(data);
            setSelectedItem(data[0] || null);
            setLoading(false);
        });
    }

    const handleDecision = async (decision: 'aprovar' | 'reprovar') => {
        if (!selectedItem) return;
        await api.moderateVideo(selectedItem.id, decision);
        fetchQueue(); // Refresh queue
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center">Carregando fila de moderação...</div>
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex font-sans">
            <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Fila de Moderação</h1>
                <div className="space-y-2">
                    {queue.map(item => (
                        <div key={item.id} onClick={() => setSelectedItem(item)}
                             className={`p-3 rounded-lg cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            <p className="font-semibold">{item.userName} - {item.challengeTitle}</p>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>{item.checkType.toUpperCase()}</span>
                                <span className={`font-bold ${item.livenessScore < 0.6 ? 'text-red-400' : 'text-green-400'}`}>
                                    Liveness: {item.livenessScore.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
            <main className="w-3/4 p-6 grid grid-cols-2 grid-rows-2 gap-6">
                {selectedItem ? (
                    <>
                        <div className="bg-gray-800 p-4 rounded-lg col-span-1 row-span-1 flex flex-col">
                            <h2 className="text-xl font-bold mb-2">Vídeo ({selectedItem.checkType})</h2>
                            <div className="flex-grow bg-black rounded">
                                <img src={selectedItem.videoUrl} alt="Video" className="w-full h-full object-contain"/>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg col-span-1 row-span-2 flex flex-col">
                           <h2 className="text-xl font-bold mb-2">Métricas e Ações</h2>
                           <div className="space-y-3 text-sm mb-4">
                               <p><strong>Usuário:</strong> {selectedItem.userName} ({selectedItem.userId})</p>
                               <p><strong>Desafio:</strong> {selectedItem.challengeTitle}</p>
                               <p><strong>Distância Percorrida:</strong> {selectedItem.metricsSummary.distance.toFixed(2)} km</p>
                               <p><strong>Velocidade Média:</strong> <span className={selectedItem.metricsSummary.avgSpeed > 25 ? 'text-red-400 font-bold' : ''}>{selectedItem.metricsSummary.avgSpeed.toFixed(2)} km/h</span></p>
                               <p><strong>Score Liveness:</strong> <span className={selectedItem.livenessScore < 0.6 ? 'text-red-400 font-bold' : ''}>{selectedItem.livenessScore.toFixed(2)}</span></p>
                           </div>
                           <div className="flex-grow bg-black rounded my-4">
                                <img src={`https://picsum.photos/seed/${selectedItem.id}/800/600`} alt="Map placeholder" className="w-full h-full object-cover opacity-50"/>
                           </div>
                           <div className="flex space-x-4">
                                <button onClick={() => handleDecision('aprovar')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">Aprovar</button>
                                <button onClick={() => handleDecision('reprovar')} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg">Reprovar</button>
                           </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg col-span-1 row-span-1 flex flex-col">
                            <h2 className="text-xl font-bold mb-2">Gráfico de Velocidade</h2>
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={selectedItem.gpsTraces} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR')} stroke="#A0AEC0" fontSize={12} />
                                    <YAxis stroke="#A0AEC0" fontSize={12} label={{ value: 'km/h', angle: -90, position: 'insideLeft', fill: '#A0AEC0' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#2D3748', border: 'none'}} labelStyle={{color: '#E2E8F0'}}/>
                                    <Legend />
                                    <Line type="monotone" dataKey="speed" name="Velocidade" stroke="#38B2AC" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="col-span-2 row-span-2 flex items-center justify-center bg-gray-800 rounded-lg">
                        <p className="text-xl text-gray-400">Selecione um item da fila para revisar.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Moderation;
