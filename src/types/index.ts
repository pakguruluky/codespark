export type UserRole = 'student' | 'instructor' | 'admin';

export type TierId = 'pemula' | 'menengah' | 'lanjutan';

export type ProgressTierId = TierId | 'app_maker' | 'game_maker' | 'ai_ml';

export type ProgramId = 'studio' | 'app_maker' | 'game_maker' | 'ai_ml';

export type AppMakerProjectId =
  | 'app_photogram'
  | 'app_todo'
  | 'app_calculator'
  | 'app_color'
  | 'app_weather';

export type GameMakerProjectId =
  | 'game_image_match'
  | 'game_memory_card'
  | 'game_color_puzzle'
  | 'game_save_polar_bear'
  | 'game_space_mission';

export type AiMlProjectId = 'aiml_cartoonizer' | 'aiml_face_detection';

export type CodeLanguage = 'python' | 'javascript';

export type Direction = 'N' | 'E' | 'S' | 'W';

export interface Instructor {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  specialty: string;
  ownerUid: string;
  createdAt: string;
}

export interface AccessCode {
  id: string;
  code: string;
  className: string;
  createdByRole: 'admin' | 'instructor';
  createdById: string;
  createdByName: string;
  ownerUid: string;
  isActive: boolean;
  isTrial?: boolean;
  includeAppMaker?: boolean;
  includeGameMaker?: boolean;
  includeAiMl?: boolean;
  createdAt: string;
}

export interface AppSettings {
  adminPhone: string;
  adminContactName: string;
  upgradeMessage: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  accessCode: string;
  className: string;
  instructorId: string;
  instructorName: string;
  instructorUid: string;
  ownerUid: string;
  hasAppMakerAccess?: boolean;
  requestedAppMaker?: boolean;
  hasGameMakerAccess?: boolean;
  requestedGameMaker?: boolean;
  hasAiMlAccess?: boolean;
  requestedAiMl?: boolean;
  createdAt: string;
}

export interface ProgressRecord {
  id: string;
  studentId: string;
  levelId: string;
  tier: ProgressTierId;
  stars: 1 | 2 | 3;
  codeSubmitted: string;
  language: CodeLanguage;
  ownerUid: string;
  instructorUid: string;
  completedAt: string;
}

export interface CertificateRecord {
  id: string;
  certificateNo: string;
  studentId: string;
  studentName: string;
  tierId: ProgressTierId;
  tierName: string;
  instructorName: string;
  instructorUid: string;
  ownerUid: string;
  issuedAt: string;
}

export interface AppSession {
  role: UserRole;
  id: string;
  name: string;
  username: string;
  className?: string;
  instructorId?: string;
  instructorName?: string;
  instructorUid?: string;
  accessCode?: string;
  specialty?: string;
  hasAppMakerAccess?: boolean;
  requestedAppMaker?: boolean;
  hasGameMakerAccess?: boolean;
  requestedGameMaker?: boolean;
  hasAiMlAccess?: boolean;
  requestedAiMl?: boolean;
}

export interface GridCoord {
  x: number;
  y: number;
}

export interface LevelDefinition {
  id: string;
  order: number;
  tier: TierId;
  tierLabel: string;
  title: string;
  subtitle: string;
  concept: string;
  mission: string;
  hint: string;
  gridWidth: number;
  gridHeight: number;
  start: { x: number; y: number; dir: Direction };
  goal: GridCoord;
  gems: GridCoord[];
  walls: GridCoord[];
  optimalLines: number;
  twoStarLines: number;
  starterBlocks: CodeBlockItem[];
  recommendedBlocks: BlockType[];
}

export type BlockType =
  | 'move_forward'
  | 'turn_left'
  | 'turn_right'
  | 'repeat'
  | 'if_path_clear'
  | 'if_gem_ahead';

export interface CodeBlockItem {
  id: string;
  type: BlockType;
  steps?: number;
  count?: number;
  children?: CodeBlockItem[];
  elseChildren?: CodeBlockItem[];
}

export type SoundEvent = 'step' | 'turn' | 'gem' | 'crash' | 'success' | 'incomplete';

export interface ExecutionFrame {
  x: number;
  y: number;
  dir: Direction;
  collectedGems: string[];
  activeLine: number;
  actionLabel: string;
  status: 'running' | 'success' | 'crashed' | 'incomplete';
  soundEvent: SoundEvent;
  errorMessage?: string;
}

export interface ExecutionResult {
  frames: ExecutionFrame[];
  success: boolean;
  stars: 0 | 1 | 2 | 3;
  lineCount: number;
  errorMessage?: string;
  errorLine?: number;
}

export type FirebaseConnectionStatus = 'connecting' | 'connected' | 'auth_required' | 'offline';

export interface DataStoreSnapshot {
  instructors: Instructor[];
  accessCodes: AccessCode[];
  students: Student[];
  progress: ProgressRecord[];
  certificates: CertificateRecord[];
  settings: AppSettings;
  mode: 'firebase' | 'local';
  firebaseConnected: boolean;
  firebaseStatus: FirebaseConnectionStatus;
  firebaseError: string | null;
  firebaseUserEmail: string | null;
  lastSyncedAt: string | null;
  loading: boolean;
}
