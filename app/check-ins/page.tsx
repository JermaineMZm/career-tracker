"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CheckInHistoryPage() {
  const supabase = supabaseBrowser();

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setEntries(data);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">
      <h1 className="text-3xl font-bold mb-6">Your Check-In History</h1>

      {/* Mood Chart */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h2 className="text-2xl font-semibold mb-4">Mood Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={entries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="created_at"
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })
              }
            />
            <YAxis domain={[1, 10]} />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString()}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Check-In Entries */}
      <div className="space-y-6">
        {entries?.map((entry) => (
          <div key={entry.id} className="bg-white p-6 rounded shadow border">
            <p className="text-sm text-gray-600 mb-2">
              {new Date(entry.created_at).toLocaleString()}
            </p>

            <p className="mb-2">
              <strong>Mood:</strong> {entry.mood}/10
            </p>

            <p className="mb-2">
              <strong>What you worked on:</strong><br />
              {entry.content}
            </p>

            <p className="mb-2">
              <strong>Challenges:</strong><br />
              {entry.challenges}
            </p>

            {entry.ai_summary && (
              <div className="mt-4 p-3 bg-blue-50 border rounded">
                <p className="font-semibold mb-1">AI Summary</p>
                <p>{entry.ai_summary}</p>
              </div>
            )}

            {entry.ai_suggestions && (
              <div className="mt-4 p-3 bg-green-50 border rounded">
                <p className="font-semibold mb-1">AI Suggestions</p>
                <ul className="list-disc ml-6">
                  {entry.ai_suggestions.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
