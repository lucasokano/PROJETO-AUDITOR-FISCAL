const TOPIC_HEADER = /^\[Tópico:\s*(.+)]$/i;
const SUBTOPIC_HEADER = /^\[Subtópico:\s*(.+)]$/i;

const MAX_QUESTIONS_PER_BATCH = 100;
const MAX_BATCH_BYTES = 48 * 1024;

interface ParsedQuestion {
  line: number;
  topic: string;
  subtopic: string;
  text: string;
}

export interface ClozeImportBatch {
  text: string;
  sourceLines: number[];
}

function questionBlock(question: ParsedQuestion) {
  return [
    question.topic ? `[Tópico: ${question.topic}]` : null,
    question.subtopic ? `[Subtópico: ${question.subtopic}]` : null,
    question.text,
  ].filter((line): line is string => Boolean(line)).join("\n");
}

export function createClozeImportBatches(source: string): ClozeImportBatch[] {
  let topic = "";
  let subtopic = "";
  const questions: ParsedQuestion[] = [];

  source.replace(/^\uFEFF/, "").split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;

    const topicMatch = line.match(TOPIC_HEADER);
    if (topicMatch) {
      topic = topicMatch[1]!.trim();
      subtopic = "";
      return;
    }

    const subtopicMatch = line.match(SUBTOPIC_HEADER);
    if (subtopicMatch) {
      subtopic = subtopicMatch[1]!.trim();
      return;
    }

    questions.push({ line: index + 1, topic, subtopic, text: line });
  });

  const encoder = new TextEncoder();
  const batches: ClozeImportBatch[] = [];
  let blocks: string[] = [];
  let sourceLines: number[] = [];
  let byteLength = 0;

  function finishBatch() {
    if (!blocks.length) return;
    batches.push({ text: blocks.join("\n"), sourceLines });
    blocks = [];
    sourceLines = [];
    byteLength = 0;
  }

  for (const question of questions) {
    const block = questionBlock(question);
    const blockBytes = encoder.encode(block).byteLength;
    if (blockBytes > MAX_BATCH_BYTES) {
      throw new Error(`A questão da linha ${question.line} excede o limite de 48 KB por questão.`);
    }

    const separatorBytes = blocks.length ? 1 : 0;
    if (
      blocks.length >= MAX_QUESTIONS_PER_BATCH ||
      (blocks.length > 0 && byteLength + separatorBytes + blockBytes > MAX_BATCH_BYTES)
    ) {
      finishBatch();
    }

    blocks.push(block);
    sourceLines.push(question.line);
    byteLength += (blocks.length > 1 ? 1 : 0) + blockBytes;
  }

  finishBatch();
  return batches;
}
