
export enum Status {
  PLANNED = 'Planejado',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  ON_HOLD = 'Em Espera'
}

export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  startDay: number; // 1 a 35 (5 semanas * 7 dias)
  duration: number; // quantos dias dura
  status: Status;
  priority: Priority;
}

export interface ProductTrack {
  id: string;
  name: string;
  items: RoadmapItem[];
}

export interface ProjectInfo {
  name: string;
  description: string;
  tracks: ProductTrack[];
  logo?: string;
}
