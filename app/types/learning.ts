export interface LearningResource {
  name: string;
  description: string;
  url: string;
  completed?: boolean;
}

export interface LearningProgress {
  resources: LearningResource[];
  role: string;
}
