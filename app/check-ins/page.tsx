"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function CheckInHistoryPage() {
  const supabase = supabaseBrowser();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setEntries(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse-soft text-4xl mb-3">📊</div>
          <p className="text-gray-600">Loading your check-in history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 space-y-10">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-2 text-gradient">📝 Check-In History</h1>
        <p className="text-lg text-gray-600">Track your mood and progress over time</p>
      </div>

      {/* Mood Chart */}
      <div className="card-gradient p-8 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-gradient mb-6">Your Mood Trend 📈</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={entries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="created_at" 
              tickFormatter={(v) => new Date(v).toLocaleDateString()}
              stroke="#666"
            />
            <YAxis domain={[0, 10]} stroke="#666" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #667eea',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value}/10`, 'Mood']}
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="url(#gradient)" 
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#f093fb" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Entries */}
      <div>
        <h2 className="text-3xl font-bold text-gradient mb-6">All Check-Ins</h2>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="card p-8 bg-gradient-to-br from-gray-50 to-gray-100 text-center">
              <p className="text-gray-600 text-lg">No check-ins yet. Start tracking today! 🚀</p>
            </div>
          ) : (
            entries.map((e, idx) => {
              const moodEmojis: { [key: number]: string } = {
                1: "😞", 2: "😞", 3: "😐", 4: "😐", 5: "😐", 6: "😊", 7: "😊", 8: "🤩", 9: "🤩", 10: "🤩"
              };
              return (
                <div key={e.id} className="card p-6 bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        📅 {new Date(e.created_at).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{moodEmojis[e.mood] || "😐"}</span>
                        <div>
                          <p className="font-bold text-2xl text-gradient">{e.mood}/10</p>
                          <p className="text-xs text-gray-500">Mood</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {e.content && (
                    <div className="mb-4 p-4 bg-white/60 rounded-lg border-l-4 border-blue-500">
                      <p className="font-bold text-gray-800 mb-1">💪 What You Worked On</p>
                      <p className="text-gray-700">{e.content}</p>
                    </div>
                  )}

                  {e.challenges && (
                    <div className="mb-4 p-4 bg-white/60 rounded-lg border-l-4 border-orange-500">
                      <p className="font-bold text-gray-800 mb-1">🚧 Challenges</p>
                      <p className="text-gray-700">{e.challenges}</p>
                    </div>
                  )}

                  {e.ai_summary && (
                    <div className="mb-4 p-4 bg-blue-50/80 rounded-lg border-l-4 border-blue-500 border-2 border-blue-200">
                      <p className="font-bold text-blue-900 mb-1">🤖 AI Summary</p>
                      <p className="text-blue-800">{e.ai_summary}</p>
                    </div>
                  )}

                  {e.ai_suggestions && Array.isArray(e.ai_suggestions) && e.ai_suggestions.length > 0 && (
                    <div className="p-4 bg-green-50/80 rounded-lg border-l-4 border-green-500 border-2 border-green-200">
                      <p className="font-bold text-green-900 mb-3">💡 AI Suggestions</p>
                      <ul className="space-y-2">
                        {e.ai_suggestions.map((s: any, i: number) => (
                          <li key={i} className="flex gap-3 text-green-800">
                            <span className="text-lg">{["🎯", "📖", "🏆", "🚀"][i % 4]}</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
