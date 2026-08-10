import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCachedStudyStructure,
  getStudyStructure,
} from "../services/studyApi";

import type {
  Discipline,
  Subtopic,
  Topic,
} from "../types/study";

interface StudyContextValue {
  disciplines: Discipline[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  reloadStructure: () => Promise<void>;

  findDiscipline: (
    disciplineSlug?: string,
  ) => Discipline | undefined;

  findTopic: (
    disciplineSlug?: string,
    topicSlug?: string,
  ) => Topic | undefined;

  findSubtopic: (
    disciplineSlug?: string,
    topicSlug?: string,
    subtopicSlug?: string,
  ) => Subtopic | undefined;
}

interface StudyProviderProps {
  children: ReactNode;
}

const StudyContext =
  createContext<StudyContextValue | null>(null);

export function StudyProvider({
  children,
}: StudyProviderProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>(
    () => getCachedStudyStructure() ?? [],
  );

  const [isLoading, setIsLoading] = useState(
    () => getCachedStudyStructure() === null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const loadStructure = useCallback(async () => {
    const hasPreviousData = getCachedStudyStructure() !== null;
    try {
      setIsLoading(!hasPreviousData);
      setIsRefreshing(hasPreviousData);
      setError(null);

      const structure = await getStudyStructure();

      setDisciplines(structure);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Erro ao carregar a estrutura de estudos.";

      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStructure();
  }, [loadStructure]);

  const value = useMemo<StudyContextValue>(
    () => ({
      disciplines,
      isLoading,
      isRefreshing,
      error,
      reloadStructure: loadStructure,

      findDiscipline(disciplineSlug) {
        return disciplines.find(
          (discipline) =>
            discipline.slug === disciplineSlug,
        );
      },

      findTopic(disciplineSlug, topicSlug) {
        const discipline = disciplines.find(
          (item) =>
            item.slug === disciplineSlug,
        );

        return discipline?.topics.find(
          (topic) => topic.slug === topicSlug,
        );
      },

      findSubtopic(
        disciplineSlug,
        topicSlug,
        subtopicSlug,
      ) {
        const discipline = disciplines.find(
          (item) =>
            item.slug === disciplineSlug,
        );

        const topic = discipline?.topics.find(
          (item) => item.slug === topicSlug,
        );

        return topic?.subtopics.find(
          (subtopic) =>
            subtopic.slug === subtopicSlug,
        );
      },
    }),
    [
      disciplines,
      error,
      isLoading,
      isRefreshing,
      loadStructure,
    ],
  );

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);

  if (!context) {
    throw new Error(
      "useStudy deve ser usado dentro de StudyProvider.",
    );
  }

  return context;
}
