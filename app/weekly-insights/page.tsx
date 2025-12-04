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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse-soft text-4xl mb-3">📊</div>
          <p className="text-gray-600">Generating your weekly insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card-gradient p-10 text-center max-w-md">
          <p className="text-gray-600 text-lg mb-4">No insights available for this week yet.</p>
          <p className="text-gray-500 text-sm">Come back after completing a few check-ins!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 space-y-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2 text-gradient">📊 Weekly Insights</h1>
        <p className="text-lg text-gray-600">Your personalized career progress report</p>
      </div>

      {/* Weekly Summary */}
      <div className="card-gradient p-8 border-2 border-purple-200">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl">📝</span>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Weekly Summary</h2>
            <p className="text-sm text-gray-600">Overview of your week</p>
          </div>
        </div>
        <div className="bg-white/50 p-6 rounded-lg border border-purple-200 text-gray-800">
          {insights.weeklySummary}
        </div>
      </div>

      {/* Mood Analysis */}
      <div className="card p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl">😊</span>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Mood Analysis</h2>
            <p className="text-sm text-gray-600">How you've been feeling</p>
          </div>
        </div>
        <div className="bg-white/50 p-6 rounded-lg border border-blue-200 text-gray-800">
          {insights.moodAnalysis}
        </div>
      </div>

      {/* Achievements & Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Achievements */}
        <div className="card p-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 border-2 border-green-200">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h2 className="text-2xl font-bold text-gradient">Achievements</h2>
              <p className="text-sm text-gray-600">What you accomplished</p>
            </div>
          </div>
          <ul className="space-y-3">
            {insights.progressAchievements.map((a: string, i: number) => (
              <li key={i} className="flex gap-3 p-3 bg-white/50 rounded-lg border border-green-100 hover:border-green-300 transition-all">
                <span className="text-xl">✨</span>
                <span className="text-gray-800 font-medium">{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recurring Challenges */}
        <div className="card p-8 bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-200">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">🚧</span>
            <div>
              <h2 className="text-2xl font-bold text-gradient">Challenges</h2>
              <p className="text-sm text-gray-600">Areas to focus on</p>
            </div>
          </div>
          <ul className="space-y-3">
            {insights.recurringChallenges.map((c: string, i: number) => (
              <li key={i} className="flex gap-3 p-3 bg-white/50 rounded-lg border border-orange-100 hover:border-orange-300 transition-all">
                <span className="text-xl">⚠️</span>
                <span className="text-gray-800 font-medium">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-8 bg-gradient-to-br from-pink-50 via-white to-purple-50 border-2 border-pink-200">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl">💡</span>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Next Week Recommendations</h2>
            <p className="text-sm text-gray-600">Actions to take this week</p>
          </div>
        </div>
        <ul className="space-y-3">
          {insights.nextWeekRecommendations.map((r: string, i: number) => (
            <li key={i} className="flex gap-3 p-4 bg-white/50 rounded-lg border border-pink-100 hover:border-pink-300 transition-all">
              <span className="text-xl">
                {["🎯", "📚", "💪", "🚀"][i % 4]}
              </span>
              <span className="text-gray-800 font-medium">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
