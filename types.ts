
export enum LifeStage {
  EGG = 'Egg',
  NAUPLIUS = 'Nauplius (Larva)',
  JUVENILE = 'Juvenile',
  ADULT = 'Adult',
  ELDER = 'Elder',
  DECEASED = 'Fossilized'
}

export interface Position {
  x: number;
  y: number;
  rotation: number;
}

export interface TriopsState {
  name: string;
  age: number; // in "cycles"
  hunger: number; // 0-100
  health: number; // 0-100
  size: number; // scaling factor
  stage: LifeStage;
  isAlive: boolean;
  position: Position;
}

export interface TankState {
  waterQuality: number; // 0-100
  temperature: number; // Celsius
  oxygen: number; // 0-100
  isLightOn: boolean;
  eggsInSand: number;
}

export interface GameLog {
  id: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}
