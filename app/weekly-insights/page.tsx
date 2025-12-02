"use client";

import { useEffect, useState } from "react";

export default function WeeklyInsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchInsights() {
    const res = await fetch("/api/weekly-insights");
    const data = await res.json();
    setInsights(data.insights);
    setLoading(false);
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading weekly insights...</div>;
  }

  if (!insights) {
    return (
      <div className="p-10 text-center text-black">
        No insights available for this week yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">
      <h1 className="text-3xl font-bold mb-8">Weekly Insights</h1>

      {/* Weekly Summary */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Weekly Summary</h2>
        <p>{insights.weeklySummary}</p>
      </div>

      {/* Mood Analysis */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Mood Analysis</h2>
        <p>{insights.moodAnalysis}</p>
      </div>

      {/* Achievements */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Progress Achievements</h2>
        <ul className="list-disc ml-6">
          {insights.progressAchievements.map((a: string, i: number) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      {/* Challenges */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Recurring Challenges</h2>
        <ul className="list-disc ml-6">
          {insights.recurringChallenges.map((c: string, i: number) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Next Week Recommendations</h2>
        <ul className="list-disc ml-6">
          {insights.nextWeekRecommendations.map((r: string, i: number) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
