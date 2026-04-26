"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserRow {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers((data ?? []) as UserRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) =>
    `${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleCount = {
    total: users.length,
    prestataire: users.filter((u) => u.role === "prestataire").length,
    client: users.filter((u) => u.role === "client").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 40px",
          height: 68,
        }}>
        <div className="flex items-center gap-4">
          <a href="/"><img src="/logo.png" alt="Connect Event" className="h-16 w-auto object-contain" /></a>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
            🔐 Admin · Utilisateurs
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)" }}>
            ← Admin
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Utilisateurs
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Comptes inscrits sur la plateforme
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: roleCount.total, icon: "👥", color: "var(--blue2)", bg: "rgba(74,108,247,0.08)" },
            { label: "Prestataires", value: roleCount.prestataire, icon: "🎵", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
            { label: "Clients", value: roleCount.client, icon: "👤", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
            { label: "Admins", value: roleCount.admin, icon: "🔐", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
          <div className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-black text-xl" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              {loading ? "Chargement..." : `${filtered.length} utilisateur${filtered.length > 1 ? "s" : ""}`}
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-all"
              style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", width: 220 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {loading ? (
            <div className="py-16 text-center" style={{ color: "var(--muted)" }}>
              <div className="text-4xl mb-3">⏳</div>
              <p className="font-bold text-sm">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center" style={{ color: "var(--muted)" }}>
              <div className="text-4xl mb-3">👥</div>
              <p className="font-bold text-sm">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  {["Email", "Rôle", "Inscrit le"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest"
                      style={{ color: "var(--muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "white")}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                          style={{ background: "var(--grad)" }}>
                          {u.email?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-semibold text-sm" style={{ color: "var(--dark)" }}>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                        style={{
                          background: u.role === "prestataire" ? "rgba(124,58,237,0.1)" : u.role === "admin" ? "rgba(220,38,38,0.1)" : "rgba(34,197,94,0.1)",
                          color: u.role === "prestataire" ? "#7c3aed" : u.role === "admin" ? "#dc2626" : "#16a34a",
                        }}>
                        {u.role === "prestataire" ? "🎵 Prestataire" : u.role === "admin" ? "🔐 Admin" : "👤 Client"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color: "var(--muted)" }}>
                      {new Date(u.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
