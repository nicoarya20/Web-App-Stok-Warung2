import { betterAuth } from "better-auth";
import { admin, createAccessControl } from "better-auth/plugins";
import { db } from "./db.js";

const ac = createAccessControl({
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "set-email", "get", "update"],
  session: ["list", "revoke", "delete"],
});

const fullAccess = ac.newRole({
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "set-email", "get", "update"],
  session: ["list", "revoke", "delete"],
});

const customRoles = {
  superadmin: fullAccess,
  admin: fullAccess,
  user: ac.newRole({ user: [], session: [] }),
  pending: ac.newRole({ user: [], session: [] }),
};

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    admin({
      defaultRole: "pending",
      adminRoles: ["admin", "superadmin"],
      roles: customRoles,
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const superadminEmail = process.env.SUPERADMIN_EMAIL;
          if (superadminEmail && user.email === superadminEmail) {
            await db.query('UPDATE "user" SET role = $1 WHERE id = $2', ["superadmin", user.id]);
          }
        },
      },
    },
  },
});
