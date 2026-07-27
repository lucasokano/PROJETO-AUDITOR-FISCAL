export interface Subtopic {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface Discipline {
  id: string;
  name: string;
  topics: Topic[];
}

export const studyStructure: Discipline[] = [
  {
    id: "informatica",
    name: "Informática",
    topics: [
      {
        id: "redes",
        name: "Redes de Computadores",
        subtopics: [
          { id: "modelo-osi", name: "Modelo OSI" },
          { id: "tcp-ip", name: "Modelo TCP/IP" },
          { id: "ipv4", name: "IPv4" },
          { id: "ipv6", name: "IPv6" },
          { id: "dns", name: "DNS" },
          { id: "dhcp", name: "DHCP" },
          { id: "http", name: "HTTP e HTTPS" },
        ],
      },
      {
        id: "banco-de-dados",
        name: "Banco de Dados",
        subtopics: [
          { id: "modelo-relacional", name: "Modelo Relacional" },
          { id: "sql", name: "SQL" },
          { id: "normalizacao", name: "Normalização" },
          { id: "transacoes", name: "Transações" },
          { id: "indices", name: "Índices" },
        ],
      },
      {
        id: "seguranca",
        name: "Segurança da Informação",
        subtopics: [
          { id: "criptografia", name: "Criptografia" },
          { id: "malware", name: "Malware" },
          { id: "engenharia-social", name: "Engenharia Social" },
          { id: "autenticacao", name: "Autenticação" },
        ],
      },
    ],
  },
  {
    id: "portugues",
    name: "Português",
    topics: [
      {
        id: "gramatica",
        name: "Gramática",
        subtopics: [
          { id: "classes-palavras", name: "Classes de Palavras" },
          { id: "concordancia", name: "Concordância" },
          { id: "regencia", name: "Regência" },
          { id: "crase", name: "Crase" },
        ],
      },
      {
        id: "interpretacao",
        name: "Interpretação de Texto",
        subtopics: [
          { id: "inferencia", name: "Inferência" },
          { id: "coesao", name: "Coesão Textual" },
          { id: "coerencia", name: "Coerência Textual" },
        ],
      },
    ],
  },
  {
    id: "legislacao",
    name: "Legislação",
    topics: [
      {
        id: "direito-administrativo",
        name: "Direito Administrativo",
        subtopics: [
          { id: "atos-administrativos", name: "Atos Administrativos" },
          { id: "poderes-administrativos", name: "Poderes Administrativos" },
          { id: "agentes-publicos", name: "Agentes Públicos" },
        ],
      },
    ],
  },
];

export function findDiscipline(disciplineId?: string) {
  return studyStructure.find(
    (discipline) => discipline.id === disciplineId,
  );
}

export function findTopic(
  disciplineId?: string,
  topicId?: string,
) {
  return findDiscipline(disciplineId)?.topics.find(
    (topic) => topic.id === topicId,
  );
}