"use client";

import { useMemo, useState } from "react";

import { createEmptyCard, fsrs, Grade, Rating } from "ts-fsrs";

type RatingName = "Again" | "Hard" | "Good" | "Easy";

const ratings: RatingName[] = ["Again", "Hard", "Good", "Easy"];

const ratingMap: { [key in string]: Grade } = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy,
};

export default function FsrsSimulator() {
  const [retention, setRetention] = useState(0.9);

  const [vocabularySize, setVocabularySize] = useState(10000);

  const [simulationDays, setSimulationDays] = useState(365);

  const [rating, setRating] = useState<RatingName>("Good");

  const [maximumInterval, setMaximumInterval] = useState(36500);

  const [enableFuzz, setEnableFuzz] = useState(false);

  const result = useMemo(() => {
    const scheduler = fsrs({
      request_retention: retention,
      maximum_interval: maximumInterval,
      enable_fuzz: enableFuzz,
    });

    let card = createEmptyCard();

    const events: Array<{
      review: number;
      day: number;
      interval: number;
      stability: number;
      difficulty: number;
    }> = [];

    let day = 0;

    while (day < simulationDays) {
      const now = new Date(Date.now() + day * 86400000);

      const result = scheduler.next(card, now, ratingMap[rating]);

      card = result.card;

      const nextInterval = Math.max(
        1,
        Math.round((card.due.getTime() - now.getTime()) / 86400000),
      );

      events.push({
        review: events.length + 1,
        day,
        interval: nextInterval,
        stability: card.stability,
        difficulty: card.difficulty,
      });

      day += nextInterval;
    }

    const reviewsPerCard = events.length;

    const reviewsPerYear = reviewsPerCard / (simulationDays / 365);

    const totalReviews = reviewsPerCard * vocabularySize;

    return {
      events,
      reviewsPerCard,
      reviewsPerYear,
      totalReviews,
    };
  }, [
    retention,
    vocabularySize,
    simulationDays,
    rating,
    maximumInterval,
    enableFuzz,
  ]);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="mb-2 text-4xl font-bold">FSRS Simulator</h1>

      <p className="mb-8 text-gray-600">
        Interactive demonstration of the Free Spaced Repetition Scheduler.
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* PARAMETERS */}

        <section className="rounded-xl border p-6">
          <h2 className="mb-6 text-xl font-semibold">Parameters</h2>

          <label className="mb-2 block">Desired retention</label>

          <div className="mb-6 flex items-center gap-3">
            <input
              type="range"
              min="0.70"
              max="0.99"
              step="0.01"
              value={retention}
              onChange={(e) => setRetention(Number(e.target.value))}
              className="flex-1"
            />

            <span className="w-14 text-right font-mono">
              {(retention * 100).toFixed(0)}%
            </span>
          </div>

          <label className="mb-2 block">Vocabulary items</label>

          <input
            type="number"
            min="1"
            value={vocabularySize}
            onChange={(e) => setVocabularySize(Number(e.target.value))}
            className="mb-6 w-full rounded border p-2"
          />

          <label className="mb-2 block">Simulation period</label>

          <select
            value={simulationDays}
            onChange={(e) => setSimulationDays(Number(e.target.value))}
            className="mb-6 w-full rounded border p-2"
          >
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
            <option value={730}>2 years</option>
            <option value={1825}>5 years</option>
          </select>

          <label className="mb-2 block">Simulated answer</label>

          <select
            value={rating}
            onChange={(e) => setRating(e.target.value as RatingName)}
            className="mb-6 w-full rounded border p-2"
          >
            {ratings.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <label className="mb-2 block">Maximum interval</label>

          <input
            type="number"
            value={maximumInterval}
            onChange={(e) => setMaximumInterval(Number(e.target.value))}
            className="mb-6 w-full rounded border p-2"
          />

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={enableFuzz}
              onChange={(e) => setEnableFuzz(e.target.checked)}
            />
            Enable FSRS fuzzing
          </label>
        </section>

        {/* STATISTICS */}

        <section className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Reviews / card" value={result.reviewsPerCard} />

            <StatCard
              title="Reviews / card / year"
              value={result.reviewsPerYear.toFixed(1)}
            />

            <StatCard
              title="Total reviews"
              value={result.totalReviews.toLocaleString()}
            />
          </div>

          <div className="mt-8 rounded-xl border">
            <div className="border-b p-4">
              <h2 className="font-semibold">Review schedule</h2>
            </div>

            <div className="max-h-[600px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="p-3 text-left">#</th>

                    <th className="p-3 text-left">Day</th>

                    <th className="p-3 text-left">Next interval</th>

                    <th className="p-3 text-left">Stability</th>

                    <th className="p-3 text-left">Difficulty</th>
                  </tr>
                </thead>

                <tbody>
                  {result.events.map((event) => (
                    <tr key={event.review} className="border-b">
                      <td className="p-3">{event.review}</td>

                      <td className="p-3">{event.day}</td>

                      <td className="p-3">{event.interval} days</td>

                      <td className="p-3">{event.stability.toFixed(2)}</td>

                      <td className="p-3">{event.difficulty.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-6">
      <div className="text-sm text-gray-500">{title}:</div>

      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
