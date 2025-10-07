
export enum ChallengeType {
  CAMINHADA = 'caminhada',
  CICLISMO = 'ciclismo',
  FLEXOES = 'flexoes',
  ABDOMINAIS = 'abdominais',
  ACADEMIA = 'academia',
}

export enum UserPlan {
  GRATUITO = 'Gratuito',
  GOLD = 'Gold',
  DIAMOND = 'Diamond',
}

export enum KycStatus {
  NAO_INICIADO = 'nao_iniciado',
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  REPROVADO = 'reprovado',
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf_hash: string;
  state: string;
  plan: UserPlan;
  xp: number;
  saldo: number; // in cents
  device_id: string;
  kyc_status: KycStatus;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  description: string;
  rules: { days: number; distance?: number; reps?: number, time?: number, window: number };
  entryValue: number; // in cents
  vacancies: number;
  participantsCount: number;
  startDate: Date;
  endDate: Date;
  registrationEnd: Date;
}

export interface Participation {
  id: string;
  challengeId: string;
  userId: string;
  status: 'inscrito' | 'ativo' | 'completo' | 'desqualificado';
  checkins: Checkin[];
}

export interface Checkin {
  day: number;
  status: 'pendente' | 'checkin_feito' | 'em_progresso' | 'checkout_feito' | 'aprovado' | 'reprovado';
  checkinVideoId?: string;
  checkoutVideoId?: string;
  gpsTraces?: { lat: number, lng: number, timestamp: number }[];
  metricsSummary?: { distance: number, avgSpeed: number };
}

export interface Transaction {
    id: string;
    type: 'deposito' | 'saque' | 'entrada_desafio';
    amount: number; // in cents
    fee: number; // in cents
    status: 'pendente' | 'concluido' | 'falhou';
    createdAt: Date;
}

export interface ModerationItem {
  id: string;
  videoId: string;
  participationId: string;
  challengeId: string;
  userId: string;
  userName: string;
  videoUrl: string;
  challengeTitle: string;
  checkType: 'checkin' | 'checkout';
  livenessScore: number;
  gpsTraces: { lat: number, lng: number, timestamp: number, speed?: number }[];
  metricsSummary: { distance: number, avgSpeed: number };
  timestamp: Date;
}