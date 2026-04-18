const MIN_SCORE = 1;
const MAX_SCORE = 45;
const REQUIRED_NUMBERS = 5;

const PRIZE_SHARES = {
  match_5: 0.4,
  match_4: 0.35,
  match_3: 0.25,
} as const;

export type DrawMode = "random" | "weighted";

export interface DrawSimulationInput {
  mode: DrawMode;
  basePrizePoolInr: number;
  jackpotRolloverInr: number;
  userNumbers: Record<string, number[]>;
}

export interface DrawSimulationOutput {
  mode: DrawMode;
  winningNumbers: number[];
  winnerCounts: {
    match_5: number;
    match_4: number;
    match_3: number;
  };
  payoutsPerWinner: {
    match_5: number;
    match_4: number;
    match_3: number;
  };
  carriedRolloverInr: number;
}

function isValidNumber(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_SCORE && value <= MAX_SCORE;
}

function pickUniqueNumbers(pool: number[], count: number): number[] {
  const available = [...pool];
  const picked: number[] = [];

  while (picked.length < count && available.length > 0) {
    const index = Math.floor(Math.random() * available.length);
    const [value] = available.splice(index, 1);
    picked.push(value);
  }

  return picked.sort((a, b) => a - b);
}

function randomWinningNumbers(): number[] {
  const allNumbers = Array.from({ length: MAX_SCORE }, (_, index) => index + 1);
  return pickUniqueNumbers(allNumbers, REQUIRED_NUMBERS);
}

function weightedWinningNumbers(userNumbers: Record<string, number[]>): number[] {
  const frequencies = new Map<number, number>();
  Object.values(userNumbers).forEach((numbers) => {
    numbers.forEach((number) => {
      if (isValidNumber(number)) {
        frequencies.set(number, (frequencies.get(number) ?? 0) + 1);
      }
    });
  });

  const weightedPool: number[] = [];
  for (let number = MIN_SCORE; number <= MAX_SCORE; number += 1) {
    const weight = (frequencies.get(number) ?? 0) + 1;
    for (let index = 0; index < weight; index += 1) {
      weightedPool.push(number);
    }
  }

  const selected = new Set<number>();
  while (selected.size < REQUIRED_NUMBERS) {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    selected.add(weightedPool[randomIndex]);
  }

  return [...selected].sort((a, b) => a - b);
}

function countMatches(left: number[], right: number[]): number {
  const set = new Set(right);
  return left.filter((value) => set.has(value)).length;
}

function calculateWinners(userNumbers: Record<string, number[]>, winningNumbers: number[]) {
  const winnerCounts = { match_5: 0, match_4: 0, match_3: 0 };

  Object.values(userNumbers).forEach((numbers) => {
    const validUnique = [...new Set(numbers.filter(isValidNumber))].slice(0, REQUIRED_NUMBERS);
    const matches = countMatches(validUnique, winningNumbers);

    if (matches >= 5) winnerCounts.match_5 += 1;
    else if (matches === 4) winnerCounts.match_4 += 1;
    else if (matches === 3) winnerCounts.match_3 += 1;
  });

  return winnerCounts;
}

function splitPrizePool(
  basePrizePoolInr: number,
  jackpotRolloverInr: number,
  winnerCounts: { match_5: number; match_4: number; match_3: number },
) {
  const jackpotPool = Math.floor(basePrizePoolInr * PRIZE_SHARES.match_5) + jackpotRolloverInr;
  const match4Pool = Math.floor(basePrizePoolInr * PRIZE_SHARES.match_4);
  const match3Pool = Math.floor(basePrizePoolInr * PRIZE_SHARES.match_3);

  const payoutsPerWinner = {
    match_5: winnerCounts.match_5 > 0 ? Math.floor(jackpotPool / winnerCounts.match_5) : 0,
    match_4: winnerCounts.match_4 > 0 ? Math.floor(match4Pool / winnerCounts.match_4) : 0,
    match_3: winnerCounts.match_3 > 0 ? Math.floor(match3Pool / winnerCounts.match_3) : 0,
  };

  const carriedRolloverInr = winnerCounts.match_5 === 0 ? jackpotPool : 0;

  return {
    payoutsPerWinner,
    carriedRolloverInr,
  };
}

export function runDrawSimulation(input: DrawSimulationInput): DrawSimulationOutput {
  const winningNumbers = input.mode === "weighted" ? weightedWinningNumbers(input.userNumbers) : randomWinningNumbers();
  const winnerCounts = calculateWinners(input.userNumbers, winningNumbers);
  const { payoutsPerWinner, carriedRolloverInr } = splitPrizePool(
    input.basePrizePoolInr,
    input.jackpotRolloverInr,
    winnerCounts,
  );

  return {
    mode: input.mode,
    winningNumbers,
    winnerCounts,
    payoutsPerWinner,
    carriedRolloverInr,
  };
}

