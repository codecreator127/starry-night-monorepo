import { Event } from '@/data/event';

export type ViewState = 'OVERVIEW' | 'NEBULA' | 'DETAIL';

export interface Position {
  top: number; // percentage
  left: number; // percentage
}

export interface CVData {
  id: string;
  position: Position;
  title: string;
  pdfUrl?: string;
}

export interface ProjectStar {
  id: string;
  event: Event;
  position: Position;
}

export interface NebulaCluster {
  clusterId: number;
  name: string;
  position: Position;
  projects: ProjectStar[];
  color: string;
}

export interface CameraState {
  scale: number;
  x: number;
  y: number;
}

export interface PortfolioState {
  viewState: ViewState;
  activeNebula: NebulaCluster | null;
  activeProject: Event | null;
  camera: CameraState;
}
