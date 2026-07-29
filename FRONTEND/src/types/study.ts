export interface Subtopic {
  id: number;
  name: string;
  slug: string;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
  subtopics: Subtopic[];
}

export interface Discipline {
  id: number;
  name: string;
  slug: string;
  topics: Topic[];
}

export interface Statement {
  id: number;
  text: string;
  correctAnswer: boolean;
}