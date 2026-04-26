import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

export type AppRole = "admin" | "sppg" | "logistik" | "sekolah" | "vendor";

const ALLOWED_SIGNUP_ROLES: AppRole[] = ["sppg", "logistik", "sekolah", "vendor"];

function isAppRole(value: unknown): value is AppRole {
  return (
    value === "admin" ||
    value === "sppg" ||
    value === "logistik" ||
    value === "sekolah" ||
    value === "vendor"
  );
}

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "dev-only-insecure-secret-change-me",
  database: new Database(process.env.BETTER_AUTH_DB_PATH ?? "better-auth.sqlite"),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      appRole: {
        type: "string",
        required: false,
        defaultValue: "vendor",
      },
      organizationName: { type: "string", required: false },
      nib: { type: "string", required: false },
      npwp: { type: "string", required: false },
      npsn: { type: "string", required: false },
      phone: { type: "string", required: false },
      jenjang: { type: "string", required: false },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const body = (ctx.body ?? {}) as Record<string, unknown>;
      const roleCandidate = body.appRole;
      const appRole: AppRole = isAppRole(roleCandidate) ? roleCandidate : "vendor";

      if (!ALLOWED_SIGNUP_ROLES.includes(appRole)) {
        throw new APIError("BAD_REQUEST", {
          message: "Role ini tidak mendukung registrasi mandiri.",
        });
      }

      const organizationName = String(body.organizationName ?? "").trim();
      const nib = String(body.nib ?? "").trim();
      const npwp = String(body.npwp ?? "").trim();
      const npsn = String(body.npsn ?? "").trim();
      const jenjang = String(body.jenjang ?? "SMA").trim();

      if (!organizationName) {
        throw new APIError("BAD_REQUEST", {
          message: "Nama institusi wajib diisi.",
        });
      }

      if (appRole === "sekolah") {
        if (!npsn) {
          throw new APIError("BAD_REQUEST", { message: "NPSN wajib diisi." });
        }
        if (!["SD", "SMP", "SMA"].includes(jenjang)) {
          throw new APIError("BAD_REQUEST", { message: "Jenjang tidak valid." });
        }
      } else if (!nib) {
        throw new APIError("BAD_REQUEST", { message: "NIB wajib diisi." });
      }

      if (appRole === "vendor" && !npwp) {
        throw new APIError("BAD_REQUEST", { message: "NPWP wajib diisi untuk vendor." });
      }

      return {
        context: {
          ...(ctx as object),
          body: {
            ...(body as object),
            appRole,
            organizationName,
            nib,
            npwp,
            npsn,
            jenjang,
            name: String(body.name ?? organizationName).trim() || organizationName,
          },
        },
      };
    }),
  },
  plugins: [nextCookies()],
});
