import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MINIMUM_TIME = 20 * 60; // 20 minutes in seconds

const Tracking: React.FC = () => {
    const { participationId } = useParams<{ participationId: string }>();
    const navigate = useNavigate();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [distance, setDistance] = useState(0.0);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsPoints, setGpsPoints] = useState<{ lat: number; lng: number }[]>([]);
    const timerRef = useRef<number | null>(null);
    const locationWatcherRef = useRef<number | null>(null);

    const [timeLeftForCheckout, setTimeLeftForCheckout] = useState(MINIMUM_TIME);

    useEffect(() => {
        api.startTracking(participationId!);

        // Start timer
        timerRef.current = window.setInterval(() => {
            setElapsedTime(t => t + 1);
        }, 1000);

        // Start GPS tracking
        if (navigator.geolocation) {
            locationWatcherRef.current = window.navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPoint = { lat: latitude, lng: longitude };
                    setCurrentLocation(newPoint);
                    setGpsPoints(points => {
                        const newPoints = [...points, newPoint];
                        if (newPoints.length > 1) {
                            const lastPoint = newPoints[newPoints.length - 2];
                            const dist = calculateDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
                            setDistance(d => d + dist);
                        }
                        return newPoints;
                    });
                },
                (error) => console.error(`GPS Error: ${error.message} (Code: ${error.code})`),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        }

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
            if (locationWatcherRef.current) navigator.geolocation.clearWatch(locationWatcherRef.current);
        };
    }, [participationId]);

    useEffect(() => {
        if (elapsedTime < MINIMUM_TIME) {
            setTimeLeftForCheckout(MINIMUM_TIME - elapsedTime);
        } else {
            setTimeLeftForCheckout(0);
        }
    }, [elapsedTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    
    const formatFullTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // Haversine formula to calculate distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };
    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const canCheckout = elapsedTime >= MINIMUM_TIME;

    const handleCheckout = () => {
        if (!canCheckout) return;
        // Clear intervals and watchers
        if (timerRef.current) window.clearInterval(timerRef.current);
        if (locationWatcherRef.current) navigator.geolocation.clearWatch(locationWatcherRef.current);
        api.stopTracking(participationId!, gpsPoints);
        navigate(`/gravar/${participationId}/checkout`);
    };

    return (
        <div className="flex flex-col animate-fade-in-up">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-bold text-text">Executando Desafio</h1>
                <p className="text-lg text-secondary font-semibold">Dia 1 do Desafio</p>
            </header>

            {/* Map */}
            <section className="aspect-square bg-gray-900 rounded-2xl shadow-lg relative overflow-hidden my-4 border border-white/10">
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                    <p className="text-text-secondary text-sm">LOCALIZAÇÃO GPS EM TEMPO REAL</p>
                    <p className="text-xl font-mono text-white mt-2">
                        Lat: {currentLocation?.lat.toFixed(6) || 'Buscando...'}
                    </p>
                    <p className="text-xl font-mono text-white">
                        Lng: {currentLocation?.lng.toFixed(6) || 'Buscando...'}
                    </p>
                </div>
            </section>

            {/* Status Panel */}
            <section className="grid grid-cols-3 gap-2 md:gap-4 text-center bg-glass p-4 rounded-2xl shadow-lg border border-white/10">
                <div>
                    <p className="text-2xl md:text-3xl font-bold text-gradient-purple-blue">{formatFullTime(elapsedTime)}</p>
                    <p className="text-xs md:text-sm text-text-secondary">Tempo</p>
                </div>
                <div>
                    <p className="text-2xl md:text-3xl font-bold text-gradient-purple-blue">{distance.toFixed(2)}</p>
                    <p className="text-xs md:text-sm text-text-secondary">km</p>
                </div>
                <div>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">Ativo</p>
                    <p className="text-xs md:text-sm text-text-secondary">Status</p>
                </div>
            </section>

             {/* Rules */}
            <section className="bg-[#101018] border border-[#3A3A5A] p-3 rounded-lg mt-4 text-xs text-text-secondary space-y-1">
                <p>✔ Mínimo de 20 minutos ativos antes de encerrar.</p>
                <p>✔ O percurso será verificado para validação.</p>
            </section>

            {/* Checkout Button */}
            <div className="mt-6">
                <button
                    onClick={handleCheckout}
                    disabled={!canCheckout}
                    className={`w-full h-14 flex items-center justify-center rounded-xl text-white font-extrabold text-lg transition-all duration-300 shadow-lg ${
                        canCheckout 
                        ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-glow-blue/50 animate-pulse-glow' 
                        : 'bg-gray-700 cursor-not-allowed'
                    }`}
                >
                    {canCheckout ? '✅ Finalizar e Fazer Check-out' : `⏳ Liberado em ${formatTime(timeLeftForCheckout)}`}
                </button>
            </div>
        </div>
    );
};

export default Tracking;