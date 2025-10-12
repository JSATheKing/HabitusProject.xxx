import { User, Challenge, Transaction, UserPlan, KycStatus, ChallengeType, ModerationItem } from '../types';

const XANO_API_URL = import.meta.env.VITE_XANO_API_URL;

// --- MOCK DATA ---
const MOCK_USER: User = {
  id: 'user-123',
  name: 'Alex Silva',
  email: 'alex.silva@example.com',
  cpf_hash: 'mock_cpf_hash_xyz',
  state: 'SP',
  plan: UserPlan.GOLD,
  xp: 1250,
  saldo: 15000, // R$150.00
  device_id: 'device-abc-789',
  kyc_status: KycStatus.APROVADO,
  createdAt: new Date(),
};

const getFutureDate = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const MOCK_CHALLENGES: Challenge[] = [
  // Caminhada
  { id: 'c1', title: '5km por 5 Dias', type: ChallengeType.CAMINHADA, description: 'Caminhe 5 quilômetros por dia, 5 vezes em até 7 dias.', rules: { days: 5, distance: 5, window: 7 }, entryValue: 2000, vacancies: 20, participantsCount: 15, startDate: getFutureDate(2), endDate: getFutureDate(9), registrationEnd: getFutureDate(1) },
  { id: 'c2', title: '10km por 10 Dias', type: ChallengeType.CAMINHADA, description: 'Caminhe 10 quilômetros por dia, 10 vezes em até 14 dias.', rules: { days: 10, distance: 10, window: 14 }, entryValue: 4000, vacancies: 15, participantsCount: 8, startDate: getFutureDate(3), endDate: getFutureDate(17), registrationEnd: getFutureDate(2) },
  
  // Ciclismo
  { id: 'c3', title: '10km de Bike por 5 Dias', type: ChallengeType.CICLISMO, description: 'Pedale 10 quilômetros por dia, 5 vezes em até 7 dias.', rules: { days: 5, distance: 10, window: 7 }, entryValue: 2500, vacancies: 20, participantsCount: 18, startDate: getFutureDate(4), endDate: getFutureDate(11), registrationEnd: getFutureDate(3) },
  { id: 'c4', title: '20km de Bike por 10 Dias', type: ChallengeType.CICLISMO, description: 'Pedale 20 quilômetros por dia, 10 vezes em até 14 dias.', rules: { days: 10, distance: 20, window: 14 }, entryValue: 5000, vacancies: 10, participantsCount: 10, startDate: getFutureDate(5), endDate: getFutureDate(19), registrationEnd: getFutureDate(4) },

  // Flexões
  { id: 'c5', title: '10 Flexões em 30s por 5 Dias', type: ChallengeType.FLEXOES, description: 'Faça 10 flexões em 30 segundos, 5 vezes em até 7 dias.', rules: { days: 5, reps: 10, time: 30, window: 7 }, entryValue: 1000, vacancies: 30, participantsCount: 25, startDate: getFutureDate(2), endDate: getFutureDate(9), registrationEnd: getFutureDate(1) },
  { id: 'c6', title: '20 Flexões em 60s por 10 Dias', type: ChallengeType.FLEXOES, description: 'Faça 20 flexões em 60 segundos, 10 vezes em até 14 dias.', rules: { days: 10, reps: 20, time: 60, window: 14 }, entryValue: 1500, vacancies: 25, participantsCount: 26, startDate: getFutureDate(3), endDate: getFutureDate(17), registrationEnd: getFutureDate(2) },
  
  // Abdominais
  { id: 'c7', title: '20 Abdominais em 40s por 5 Dias', type: ChallengeType.ABDOMINAIS, description: 'Faça 20 abdominais em 40 segundos, 5 vezes em até 7 dias.', rules: { days: 5, reps: 20, time: 40, window: 7 }, entryValue: 1000, vacancies: 30, participantsCount: 12, startDate: getFutureDate(4), endDate: getFutureDate(11), registrationEnd: getFutureDate(3) },
  { id: 'c8', title: '40 Abdominais em 1m por 10 Dias', type: ChallengeType.ABDOMINAIS, description: 'Faça 40 abdominais em 1 minuto, 10 vezes em até 14 dias.', rules: { days: 10, reps: 40, time: 60, window: 14 }, entryValue: 1500, vacancies: 25, participantsCount: 20, startDate: getFutureDate(5), endDate: getFutureDate(19), registrationEnd: getFutureDate(4) },
  
  // Academia
  { id: 'c9', title: 'Academia por 5 Dias', type: ChallengeType.ACADEMIA, description: 'Vá para a academia 5 vezes em até 7 dias.', rules: { days: 5, window: 7 }, entryValue: 3000, vacancies: 20, participantsCount: 18, startDate: getFutureDate(6), endDate: getFutureDate(13), registrationEnd: getFutureDate(5) },
  { id: 'c10', title: 'Academia por 10 Dias', type: ChallengeType.ACADEMIA, description: 'Vá para a academia 10 vezes em até 14 dias.', rules: { days: 10, window: 14 }, entryValue: 6000, vacancies: 15, participantsCount: 7, startDate: getFutureDate(7), endDate: getFutureDate(21), registrationEnd: getFutureDate(6) },
];


const MOCK_TRANSACTIONS: Transaction[] = [
    {id: 't1', type: 'deposito', amount: 5000, fee: 0, status: 'concluido', createdAt: new Date(Date.now() - 86400000 * 5)},
    {id: 't2', type: 'entrada_desafio', amount: -2000, fee: 0, status: 'concluido', createdAt: new Date(Date.now() - 86400000 * 4)},
    {id: 't3', type: 'saque', amount: -10000, fee: 1000, status: 'pendente', createdAt: new Date(Date.now() - 86400000 * 1)},
];

const MOCK_MODERATION_ITEMS: ModerationItem[] = [
    { id: 'm1', videoId: 'v1', participationId: 'p1', challengeId: 'c1', userId: 'user-456', userName: 'Maria Costa', videoUrl: 'https://picsum.photos/seed/m1/400/300', challengeTitle: '5km por 5 Dias', checkType: 'checkin', livenessScore: 0.85, gpsTraces: Array.from({length: 10}).map((_, i) => ({lat: -23.55 + i*0.001, lng: -46.63 - i*0.001, timestamp: Date.now() + i*60000, speed: 5 + Math.random()})), metricsSummary: {distance: 5.1, avgSpeed: 5.2}, timestamp: new Date() },
    { id: 'm2', videoId: 'v2', participationId: 'p2', challengeId: 'c2', userId: 'user-789', userName: 'João Pereira', videoUrl: 'https://picsum.photos/seed/m2/400/300', challengeTitle: '30 Flexões Diárias', checkType: 'checkout', livenessScore: 0.55, gpsTraces: [], metricsSummary: {distance: 0, avgSpeed: 0}, timestamp: new Date(Date.now() - 3600000) },
    { id: 'm3', videoId: 'v3', participationId: 'p3', challengeId: 'c1', userId: 'user-012', userName: 'Ana Souza', videoUrl: 'https://picsum.photos/seed/m3/400/300', challengeTitle: '5km por 5 Dias', checkType: 'checkout', livenessScore: 0.95, gpsTraces: Array.from({length: 12}).map((_, i) => ({lat: -22.90 + i*0.001, lng: -43.17 - i*0.001, timestamp: Date.now() + i*60000, speed: 15 + Math.random()*5})), metricsSummary: {distance: 4.8, avgSpeed: 18.3}, timestamp: new Date(Date.now() - 7200000) },
];

const MOCK_PARTICIPANTS = [
  { id: 'user-123', name: 'Alex Silva', xp: 1250, progress: 60 },
  { id: 'user-456', name: 'Maria Costa', xp: 620, progress: 80 },
  { id: 'user-789', name: 'Bruno Ramos', xp: 325, progress: 40 },
  { id: 'user-012', name: 'Juliana Lima', xp: 1850, progress: 60 },
  { id: 'user-345', name: 'Carlos Souza', xp: 810, progress: 20 },
  { id: 'user-678', name: 'Fernanda Dias', xp: 2200, progress: 100 },
].sort((a, b) => b.progress - a.progress);


// --- MOCK API FUNCTIONS ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const xanoFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${XANO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Xano API error: ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  login: async (email: string, pass: string): Promise<User> => {
    try {
      const data = await xanoFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      return data;
    } catch (error) {
      await delay(500);
      if (email === "user@desafio.com" && pass === "password") {
          return MOCK_USER;
      }
      throw new Error("Credenciais inválidas");
    }
  },

  checkSession: async (): Promise<User> => {
    try {
      const data = await xanoFetch('/auth/me');
      return data;
    } catch (error) {
      await delay(200);
      return MOCK_USER;
    }
  },

  getChallenges: async (): Promise<Challenge[]> => {
    try {
      const data = await xanoFetch('/challenges');
      return data;
    } catch (error) {
      await delay(500);
      return MOCK_CHALLENGES;
    }
  },

  getChallengeById: async (id: string): Promise<Challenge | undefined> => {
    try {
      const data = await xanoFetch(`/challenges/${id}`);
      return data;
    } catch (error) {
      await delay(300);
      return MOCK_CHALLENGES.find(c => c.id === id);
    }
  },

  getChallengeRoomData: async (id: string): Promise<{ challenge: Challenge, participants: typeof MOCK_PARTICIPANTS } | null> => {
    await delay(700);
    const challenge = MOCK_CHALLENGES.find(c => c.id === id);
    if (!challenge) return null;
    return {
      challenge,
      participants: MOCK_PARTICIPANTS
    }
  },

  getUser: async (): Promise<User> => {
      await delay(200);
      return MOCK_USER;
  },
  
  getWalletTransactions: async (): Promise<Transaction[]> => {
      await delay(600);
      return MOCK_TRANSACTIONS;
  },
  
  generateKeyword: async (participationId: string, checkType: 'checkin' | 'checkout'): Promise<string> => {
    await delay(400);
    const keywords = [
      'DISCIPLINA',
      'FOCO',
      'CONSTÂNCIA',
      'HÁBITO',
      'PERSEVERANÇA',
      'FORÇA',
      'COMPROMISSO',
      'VITÓRIA',
      'EVOLUÇÃO',
      'SUPERAÇÃO'
    ];
    const randomIndex = Math.floor(Math.random() * keywords.length);
    return keywords[randomIndex];
  },

  uploadVideo: async (participationId: string, checkType: 'checkin' | 'checkout', videoBlob: Blob): Promise<{ livenessScore: number, hash: string }> => {
    await delay(1500);
    console.log(`Uploading ${checkType} video for participation ${participationId}, size: ${videoBlob.size} bytes`);
    return {
        livenessScore: Math.random() * (0.98 - 0.4) + 0.4,
        hash: `mock_hash_${Date.now()}`
    };
  },
  
  startTracking: async (participationId: string): Promise<boolean> => {
    await delay(200);
    console.log(`Started tracking for participation ${participationId}`);
    return true;
  },
  
  stopTracking: async (participationId: string, gpsTraces: any[]): Promise<boolean> => {
    await delay(200);
    console.log(`Stopped tracking for participation ${participationId} with ${gpsTraces.length} points.`);
    return true;
  },

  getModerationQueue: async (): Promise<ModerationItem[]> => {
      await delay(800);
      return MOCK_MODERATION_ITEMS.sort((a,b) => a.livenessScore - b.livenessScore);
  },

  moderateVideo: async (moderationId: string, decision: 'aprovar' | 'reprovar'): Promise<boolean> => {
      await delay(500);
      console.log(`Moderating item ${moderationId} with decision: ${decision}`);
      // In a real app, this would update the item's status in Firestore.
      MOCK_MODERATION_ITEMS.splice(MOCK_MODERATION_ITEMS.findIndex(item => item.id === moderationId), 1);
      return true;
  }
};