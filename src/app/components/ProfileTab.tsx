import { useState, useEffect } from "react";
import { ArrowLeft, LogOut, Clock, Users, CheckCircle, Shield, UserCircle } from "lucide-react";
import { authClient, signOut } from "@/lib/auth-client";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

interface ProfileTabProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  role: string;
  onBack: () => void;
}

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  user: { label: "Kasir", className: "bg-green-50 border border-green-200 text-green-700" },
  admin: { label: "Admin", className: "bg-blue-50 border border-blue-200 text-blue-700" },
  superadmin: { label: "Superadmin", className: "bg-purple-50 border border-purple-200 text-purple-700" },
};

export default function ProfileTab({ user, role, onBack }: ProfileTabProps) {
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = role === "admin" || role === "superadmin";
  const isSuperadmin = role === "superadmin";

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const badge = ROLE_BADGE[role] ?? { label: role, className: "bg-gray-100 border border-gray-200 text-gray-700" };

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const pendingRes = await authClient.admin.listUsers({
        query: { filterField: "role", filterValue: "pending", limit: 100 },
      });
      if (pendingRes.data) setPendingUsers(pendingRes.data.users as UserRecord[]);

      if (isSuperadmin) {
        const usersRes = await authClient.admin.listUsers({
          query: { filterField: "role", filterValue: "user", limit: 100 },
        });
        if (usersRes.data) setAllUsers(usersRes.data.users as UserRecord[]);
      }
    } finally {
      setLoadingUsers(false);
    }
  }

  async function approve(userId: string) {
    setActionLoading(userId);
    try {
      await authClient.admin.setRole({ userId, role: "user" });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setActionLoading(null);
    }
  }

  async function promoteToAdmin(userId: string) {
    setActionLoading(userId);
    try {
      await authClient.admin.setRole({ userId, role: "admin" });
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="max-w-lg mx-auto px-4 pt-5 pb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="space-y-3">
          {/* Profile card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center">
            <div className="flex justify-center mb-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold font-display">
                  {initials}
                </div>
              )}
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <div className={`mt-3 inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${badge.className}`}>
              {badge.label}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>

          {/* Admin: Kelola Akun */}
          {isAdmin && (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-base text-foreground">Kelola Akun</h3>
              </div>

              {/* Pending users */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-yellow-600" />
                  <p className="text-sm font-semibold text-foreground">Menunggu Persetujuan</p>
                  {!loadingUsers && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                      {pendingUsers.length}
                    </span>
                  )}
                </div>

                {loadingUsers ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">Tidak ada akun pending</p>
                ) : (
                  <div className="space-y-2">
                    {pendingUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5">
                        <div className="min-w-0 mr-3">
                          <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <button
                          onClick={() => approve(u.id)}
                          disabled={actionLoading === u.id}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {actionLoading === u.id ? "..." : "Approve"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Superadmin: semua kasir */}
              {isSuperadmin && (
                <div className="px-5 pb-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCircle className="w-3.5 h-3.5 text-blue-600" />
                    <p className="text-sm font-semibold text-foreground">Semua Kasir</p>
                    {!loadingUsers && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                        {allUsers.length}
                      </span>
                    )}
                  </div>

                  {loadingUsers ? (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : allUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">Belum ada kasir</p>
                  ) : (
                    <div className="space-y-2">
                      {allUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5">
                          <div className="min-w-0 mr-3">
                            <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <button
                            onClick={() => promoteToAdmin(u.id)}
                            disabled={actionLoading === u.id}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {actionLoading === u.id ? "..." : "Jadikan Admin"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
