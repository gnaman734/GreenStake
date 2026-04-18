import { ScoreEntry } from "@/lib/domain/types";

const MIN_SCORE = 1;
const MAX_SCORE = 45;
const MAX_STORED_SCORES = 5;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateScoreInput(date: string, stablefordScore: number): void {
  if (!DATE_REGEX.test(date)) {
    throw new Error("Date must be in YYYY-MM-DD format.");
  }

  if (!Number.isInteger(stablefordScore) || stablefordScore < MIN_SCORE || stablefordScore > MAX_SCORE) {
    throw new Error(`Stableford score must be an integer between ${MIN_SCORE} and ${MAX_SCORE}.`);
  }
}

function toSortedMostRecent(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date));
}

function generateScoreId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `score_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function addScore(entries: ScoreEntry[], input: { date: string; stablefordScore: number }): ScoreEntry[] {
  validateScoreInput(input.date, input.stablefordScore);

  const duplicate = entries.some((entry) => entry.date === input.date);
  if (duplicate) {
    throw new Error("Only one score entry is allowed per date.");
  }

  const now = new Date().toISOString();
  const nextEntries = [
    ...entries,
    {
      id: generateScoreId(),
      date: input.date,
      stablefordScore: input.stablefordScore,
      createdAt: now,
      updatedAt: now,
    },
  ];

  if (nextEntries.length > MAX_STORED_SCORES) {
    const oldest = [...nextEntries].sort((left, right) => left.date.localeCompare(right.date))[0];
    return toSortedMostRecent(nextEntries.filter((entry) => entry.id !== oldest.id));
  }

  return toSortedMostRecent(nextEntries);
}

export function updateScore(
  entries: ScoreEntry[],
  scoreId: string,
  input: { date: string; stablefordScore: number },
): ScoreEntry[] {
  validateScoreInput(input.date, input.stablefordScore);

  const exists = entries.some((entry) => entry.id === scoreId);
  if (!exists) {
    throw new Error("Score entry was not found.");
  }

  const duplicate = entries.some((entry) => entry.id !== scoreId && entry.date === input.date);
  if (duplicate) {
    throw new Error("Another score already exists for this date.");
  }

  const nextEntries = entries.map((entry) =>
    entry.id === scoreId
      ? {
          ...entry,
          date: input.date,
          stablefordScore: input.stablefordScore,
          updatedAt: new Date().toISOString(),
        }
      : entry,
  );

  return toSortedMostRecent(nextEntries);
}

export function deleteScore(entries: ScoreEntry[], scoreId: string): ScoreEntry[] {
  return toSortedMostRecent(entries.filter((entry) => entry.id !== scoreId));
}
