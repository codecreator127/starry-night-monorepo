export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  clusterId: number;
}
