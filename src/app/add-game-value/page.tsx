"use client";

import { useState, useEffect } from "react";

const CUSTOM_GAMES = [
  { key: "kohlapur", label: "कोहलापुर (Kohlapur)", time: "1:30 PM" },
  { key: "manipur", label: "मणिपुर (Manipur)", time: "2:30 PM" },
  { key: "palwal-city", label: "पलवल City (Palwal City)", time: "4:30 PM" },
  { key: "mathura-city", label: "मथूरा City (Mathura City)", time: "6:50 PM" },
];

export default function AddGameValuePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing values when date changes
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchValues();
  }, [isLoggedIn, date]);

  const fetchValues = async () => {
    try {
      const res = await fetch(`/api/custom-games?date=${date}`);
      const data = await res.json();
      if (data.success && data.games) {
        const existing: Record<string, string> = {};
        CUSTOM_GAMES.forEach((g) => {
          if (data.games[g.key]) existing[g.key] = data.games[g.key];
        });
        setSavedValues(existing);
        setValues(existing);
      }
    } catch {
      /* ignore */
    }
  };

  const handleLogin = () => {
    if (email === "kapil123@gmail.com" && password === "Kapil@1997") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid email or password");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const games: Record<string, string> = {};
    CUSTOM_GAMES.forEach((g) => {
      if (values[g.key]?.trim()) {
        games[g.key] = values[g.key].trim();
      }
    });

    try {
      const res = await fetch("/api/custom-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, games, date }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Values saved successfully!");
        setSavedValues({ ...savedValues, ...games });
      } else {
        setMessage("Error: " + data.error);
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h1 className="text-xl font-black text-center text-gray-900 mb-6">
            Admin Login
          </h1>
          {loginError && (
            <p className="text-red-500 text-sm text-center mb-4 font-bold">{loginError}</p>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-xl font-black text-gray-900 mb-1">Add Game Values</h1>
          <p className="text-sm text-gray-500 mb-5">Add daily results for custom games</p>

          {/* Date picker */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Game inputs */}
          <div className="space-y-4 mb-5">
            {CUSTOM_GAMES.map((game) => (
              <div key={game.key}>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {game.label}
                  <span className="text-gray-400 font-normal ml-2">({game.time})</span>
                </label>
                <input
                  type="text"
                  value={values[game.key] || ""}
                  onChange={(e) => setValues({ ...values, [game.key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter result (e.g. 45)"
                  maxLength={2}
                />
                {savedValues[game.key] && (
                  <p className="text-xs text-green-600 mt-1 font-bold">
                    Saved: {savedValues[game.key]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Values"}
          </button>

          {message && (
            <p className={`text-sm text-center mt-3 font-bold ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
