"use client";

import { useState, useEffect } from "react";

const ROLE_ORDER = [
  "FOUNDERS",
  "CO FOUNDERS",
  "OWNERS",
  "CO OWNERS",
  "STAFF MANAGER",
  "PLAYFAB",
  "COMMUNITY MANAGER",
  "HEAD ADMIN",
  "ADMIN",
  "TRIAL ADMIN",
  "HEAD MOD",
  "MOD",
  "TRIAL MOD",
];

export default function StaffManager() {
  const [roles, setRoles] = useState({});
  const [title, setTitle] = useState("\\\\ GUBBA TAG STAFF //");
  const [colorA, setColorA] = useState("#8e5cff");
  const [colorB, setColorB] = useState("#ffffff");
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("FOUNDERS");
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");
  const [savingColors, setSavingColors] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setRoles(data.roles || {});
      setTitle(data.title || "\\\\ GUBBA TAG STAFF //");
      if (data.colorA) setColorA(data.colorA);
      if (data.colorB) setColorB(data.colorB);
    } catch (e) {
      setMessage("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const addName = async () => {
    if (!newName.trim()) return;
    setMessage("Adding...");
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: selectedRole, name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      setMessage("Added!");
      await load();
    } else {
      setMessage("Failed to add");
    }
  };

  const removeName = async (role, name) => {
    setMessage("Removing...");
    const res = await fetch("/api/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, name }),
    });
    if (res.ok) {
      setMessage("Removed!");
      await load();
    } else {
      setMessage("Failed to remove");
    }
  };

  const saveColors = async () => {
    setSavingColors(true);
    setMessage("Saving gradient...");
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colorA, colorB }),
    });
    if (res.ok) {
      setMessage("Gradient saved! Unity will pick it up in a few seconds.");
    } else {
      setMessage("Failed to save gradient");
    }
    setSavingColors(false);
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", letterSpacing: 2 }}>{title}</h1>
      <p style={{ textAlign: "center", color: "#888", marginBottom: 30 }}></p>

      {/* Gradient Controls */}
      <div
        style={{
          background: "#1a1a1a",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <div style={{ marginBottom: 12, fontWeight: "bold", color: "#ccc" }}>
          Gradient Colors (live in Unity)
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#aaa" }}>
            Color A
            <input
              type="color"
              value={colorA}
              onChange={(e) => setColorA(e.target.value)}
              style={{ width: 48, height: 32, border: "none", cursor: "pointer", background: "none" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 13 }}>{colorA}</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#aaa" }}>
            Color B
            <input
              type="color"
              value={colorB}
              onChange={(e) => setColorB(e.target.value)}
              style={{ width: 48, height: 32, border: "none", cursor: "pointer", background: "none" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 13 }}>{colorB}</span>
          </label>

          <button
            onClick={saveColors}
            disabled={savingColors}
            style={{
              padding: "8px 20px",
              background: savingColors ? "#555" : "#8b5cf6",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontWeight: "bold",
              cursor: savingColors ? "not-allowed" : "pointer",
            }}
          >
            {savingColors ? "Saving..." : "Save Gradient"}
          </button>
        </div>

        {/* Preview bar */}
        <div
          style={{
            marginTop: 14,
            height: 10,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${colorA}, ${colorB})`,
          }}
        />
      </div>

      {/* Add form */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 30,
          background: "#1a1a1a",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 4,
          }}
        >
          {ROLE_ORDER.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addName()}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 4,
          }}
        />
        <button
          onClick={addName}
          style={{
            padding: "8px 20px",
            background: "#22c55e",
            color: "#000",
            border: "none",
            borderRadius: 4,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {message && (
        <p style={{ textAlign: "center", color: "#22c55e", marginBottom: 20 }}>
          {message}
        </p>
      )}

      {/* Staff list */}
      <div
        style={{
          background: "#1a1a1a",
          padding: 20,
          borderRadius: 8,
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {ROLE_ORDER.map((role) => {
          const names = roles[role] || [];
          return (
            <div key={role} style={{ marginBottom: 8 }}>
              <strong>{role}:</strong>{" "}
              {names.length === 0 ? (
                <span style={{ color: "#666" }}>NONE</span>
              ) : (
                names.map((name, i) => (
                  <span key={name + i}>
                    {name}
                    <button
                      onClick={() => removeName(role, name)}
                      style={{
                        marginLeft: 6,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: 3,
                        padding: "1px 6px",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      ×
                    </button>
                    {i < names.length - 1 ? ", " : ""}
                  </span>
                ))
              )}
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", color: "#555", marginTop: 30, fontSize: 13 }}>
        API endpoint: <code>/api/staff</code>
      </p>
    </div>
  );
}
