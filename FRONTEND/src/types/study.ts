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
  subtopicId: number;
  text: string;
  correctAnswer: boolean;

  subtopic?: {
    id: number;
    name: string;

    topic: {
      id: number;
      name: string;

      discipline: {
        id: number;
        name: string;
      };
    };
  };
}
export interface CreateStatementInput {
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
}

export interface UpdateStatementInput {
  subtopicId: number;
  text: string;
  correctAnswer: boolean;
}

export interface BulkStatementItem {
  text: string;
  correctAnswer: boolean;
}

export interface CreateStatementsBulkInput {
  subtopicId: number;
  statements: BulkStatementItem[];
}

export interface CreatedStatement
  extends Statement {
  subtopicId: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDisciplineInput {
  name: string;
}

export interface CreateTopicInput {
  disciplineId: number;
  name: string;
}

export interface CreateSubtopicInput {
  topicId: number;
  name: string;
}