export type LanPlayer = 1 | 2;

export type LanJoinMessage = { t: 'join'; name: string };
export type LanJoinedMessage = { t: 'joined'; player: LanPlayer; seed: number; matchSessionId?: string };
export type LanReadyMessage = { t: 'ready' };
export type LanMatchStartMessage = { t: 'match_start'; matchSessionId: string };
export type LanLeaveMessage = { t: 'leave'; reason?: string };

export type LanInputMessage = {
  t: 'input';
  matchSessionId: string;
  player: LanPlayer;
  seq: number;
  actionId: string;
  clientTs: number;
  data: {
    kind: 'ball';
    action: 'toggle';
  };
};

export type LanStateMessage = {
  t: 'state';
  matchSessionId: string;
  stateSeq: number;
  tick: number;
  payload: LanStatePayload;
};

export type LanStatePatchMessage = {
  t: 'state_patch';
  matchSessionId: string;
  stateSeq: number;
  baseSeq: number;
  tick: number;
  patch: Record<string, any>;
};

export type LanSyncRequestMessage = {
  t: 'sync_request';
  reason: 'join' | 'reconnect' | 'watchdog';
  matchSessionId?: string;
  clientTs?: number;
  payload?: {
    matchSessionId: string | null;
    reason: 'join' | 'reconnect' | 'watchdog';
    clientTs: number;
  };
};

export type LanInputAckMessage = {
  t: 'input_ack';
  matchSessionId: string;
  actionId: string;
  seq: number;
  accepted: boolean;
  reason?: 'not_your_turn' | 'deadline' | 'lock' | 'not_in_match' | 'animating' | 'bad_session' | 'duplicate' | 'other';
  hostTick: number;
  stateSeq?: number;
};

export type LanPingMessage = { t: 'ping'; ts: number };
export type LanPongMessage = { t: 'pong'; ts: number };

export type LanMessage =
  | LanJoinMessage
  | LanJoinedMessage
  | LanReadyMessage
  | LanMatchStartMessage
  | LanLeaveMessage
  | LanInputMessage
  | LanInputAckMessage
  | LanStateMessage
  | LanStatePatchMessage
  | LanSyncRequestMessage
  | LanPingMessage
  | LanPongMessage;

export type LanStatus =
  | 'idle'
  | 'hosting'
  | 'connecting'
  | 'connected'
  | 'waiting_start'
  | 'in_match'
  | 'error';

export type LanRole = 'HOST' | 'CLIENT' | null;

export type LanStatePayload = {
  // Core match + UI state (host authoritative)
  isWelcomeVisible: boolean;
  isSummaryVisible: boolean;
  isPlaying: boolean;
  isAnimating: boolean;
  isPenaltyMode: boolean;
  isMatchPenalty: boolean;
  isGoalActive: boolean;
  isCardActive: boolean;
  goalTeam: 'Home' | 'Away' | null;
  cardTeam: 'Home' | 'Away' | null;
  cardType: 'yellow' | 'red' | null;
  liveDigit: number | null;
  turnTimeLimitMs: number;
  turnDeadlineTs: number;

  currentTurn: 'Home' | 'Away';
  matchMinute: number;
  extraTurns: number;

  homeScore: number;
  awayScore: number;

  homeYellows: number;
  awayYellows: number;
  homeReds: number;
  awayReds: number;

  statsHomeYellows: number;
  statsAwayYellows: number;
  statsHomeReds: number;
  statsAwayReds: number;

  homePenalties: number;
  awayPenalties: number;
  homePenResults: boolean[];
  awayPenResults: boolean[];

  lastEvent: string;
  lastDigit: number | null;

  isChampionActive: boolean;
  winnerName: string;

  // Names (so both devices stay consistent)
  homeTeamName: string;
  awayTeamName: string;

  // Host→Client: last applied client input (for snapshot/ack correlation)
  lastClientInputSeq?: number;
  lastClientActionId?: string;
};

export const isLanMessage = (value: unknown): value is LanMessage => {
  if (!value || typeof value !== 'object') return false;
  const msg: any = value as any;
  const t = msg.t;
  if (typeof t !== 'string') return false;

  switch (t) {
    case 'join':
      return typeof msg.name === 'string';
    case 'joined':
      return (
        (msg.player === 1 || msg.player === 2) &&
        Number.isFinite(msg.seed) &&
        (msg.matchSessionId === undefined || typeof msg.matchSessionId === 'string')
      );
    case 'ready':
      return true;
    case 'match_start':
      return typeof msg.matchSessionId === 'string';
    case 'leave':
      return msg.reason === undefined || typeof msg.reason === 'string';
    case 'input':
      return (
        typeof msg.matchSessionId === 'string' &&
        (msg.player === 1 || msg.player === 2) &&
        Number.isFinite(msg.seq) &&
        typeof msg.actionId === 'string' &&
        Number.isFinite(msg.clientTs) &&
        msg.data?.kind === 'ball' &&
        msg.data?.action === 'toggle'
      );
    case 'input_ack':
      return (
        typeof msg.matchSessionId === 'string' &&
        Number.isFinite(msg.seq) &&
        typeof msg.actionId === 'string' &&
        typeof msg.accepted === 'boolean' &&
        Number.isFinite(msg.hostTick)
      );
    case 'state':
      return (
        typeof msg.matchSessionId === 'string' &&
        Number.isFinite(msg.stateSeq) &&
        Number.isFinite(msg.tick) &&
        msg.payload && typeof msg.payload === 'object'
      );
    case 'state_patch':
      return (
        typeof msg.matchSessionId === 'string' &&
        Number.isFinite(msg.stateSeq) &&
        Number.isFinite(msg.baseSeq) &&
        Number.isFinite(msg.tick) &&
        msg.patch && typeof msg.patch === 'object'
      );
    case 'sync_request':
      return (
        (msg.reason === 'join' || msg.reason === 'reconnect' || msg.reason === 'watchdog') &&
        (msg.matchSessionId === undefined || typeof msg.matchSessionId === 'string') &&
        (msg.clientTs === undefined || Number.isFinite(msg.clientTs)) &&
        (msg.payload === undefined ||
          (msg.payload &&
            (msg.payload.matchSessionId === null || typeof msg.payload.matchSessionId === 'string') &&
            (msg.payload.reason === 'join' ||
              msg.payload.reason === 'reconnect' ||
              msg.payload.reason === 'watchdog') &&
            Number.isFinite(msg.payload.clientTs)))
      );
    case 'ping':
    case 'pong':
      return Number.isFinite(msg.ts);
    default:
      return false;
  }
};
