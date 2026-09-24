import {
  createEmptyCard,
  fsrs,
  Grade,
  Rating,
  type Card,
} from "ts-fsrs";

export type SimulationConfig = {
  retention: number;
  vocabularySize: number;
  days: number;
  rating: "again" | "hard" | "good" | "easy";
  enableFuzz: boolean;
  maximumInterval: number;
};

export type ReviewEvent = {
  day: number;
  interval: number;
  rating: string;
  stability: number;
  difficulty: number;
};

const ratingMap: { [key in string]: Grade } = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export function simulateCard(
  config: SimulationConfig,
): ReviewEvent[] {
  const scheduler = fsrs({
    request_retention: config.retention,
    maximum_interval: config.maximumInterval,
    enable_fuzz: config.enableFuzz,
  });

  let card: Card = createEmptyCard();

  const events: ReviewEvent[] = [];

  let currentDay = 0;

  while (currentDay < config.days) {
    const result = scheduler.next(
      card,
      new Date(Date.now() + currentDay * 86400000),
      ratingMap[config.rating],
    );

    const nextCard = result.card;

    const nextDue = nextCard.due.getTime();
    const currentTime =
      Date.now() + currentDay * 86400000;

    const interval =
      Math.max(
        1,
        Math.round(
          (nextDue - currentTime) / 86400000,
        ),
      );

    events.push({
      day: currentDay,
      interval,
      rating: config.rating,
      stability: nextCard.stability,
      difficulty: nextCard.difficulty,
    });

    card = nextCard;

    currentDay += interval;
  }

  return events;
}

export function calculateStatistics(
  config: SimulationConfig,
) {
  const events = simulateCard(config);

  const reviewsPerCard = events.length;

  const totalReviews =
    reviewsPerCard * config.vocabularySize;

  const reviewsPerYear =
    reviewsPerCard / (config.days / 365);

  return {
    reviewsPerCard,
    reviewsPerYear,
    totalReviews,
    events,
  };
}