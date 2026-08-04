export interface KnowledgeCategory {
  id: number;
  name: string;
  displayOrder: number;
}

export interface KnowledgeGroup {
  id: number;
  name: string;
  instruction: string | null;
  isActive: boolean;
  categories: KnowledgeCategory[];
}

export interface KnowledgeClassification {
  id: number;
  categoryId: number;
  categoryName: string;
  groupId: number;
  groupName: string;
}

export interface KnowledgeItem {
  id: number;
  text: string;
  explanation: string | null;
  reference: string | null;
  isActive: boolean;
  classifications: KnowledgeClassification[];
}

export interface SubtopicKnowledge {
  subtopicId: number;
  groups: KnowledgeGroup[];
  items: KnowledgeItem[];
}

export interface KnowledgeImportReport {
  created: number;
  updated: number;
  ignored: number;
  missingCategories: Array<{
    line: number;
    category: string;
  }>;
}

export interface KnowledgeImportItem {
  line: number;
  text: string;
  categoryName: string;
  reference: string | null;
}
