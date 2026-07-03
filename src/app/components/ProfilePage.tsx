import { Clock, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background font-body flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center">
          {/* Avatar */}
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

          {/* Status badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium px-4 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            Menunggu persetujuan admin
          </div>

          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Akunmu sudah terdaftar. Hubungi admin untuk mendapatkan akses ke aplikasi.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
