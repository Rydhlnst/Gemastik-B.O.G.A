export type AuthApiRole = "admin" | "vendor" | "sppg" | "logistik" | "sekolah";

export type LoginPayload = {
  role: AuthApiRole;
  email: string;
  password: string;
};

export type RegisterPayload = {
  role: Exclude<AuthApiRole, "admin">;
  email: string;
  password: string;
  organizationName: string;
  nib: string;
  npwp?: string;
  npsn?: string;
  jenjang?: "SD" | "SMP" | "SMA";
  phone?: string;
};

const API_BASE_CANDIDATES = [
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "",
  "http://localhost:3000",
].filter((value): value is string => value !== undefined);

function toUrl(base: string, path: string) {
  if (!base) {
    return path;
  }
  return `${base}${path}`;
}

async function postJson(path: string, payload: unknown) {
  let lastError: Error | null = null;
  const uniqueBases = Array.from(new Set(API_BASE_CANDIDATES));

  for (const base of uniqueBases) {
    const url = toUrl(base, path);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response
        .json()
        .catch(() => ({ error: "Response server tidak valid." }));

      if (response.ok) {
        return result;
      }

      if (!base && response.status === 404) {
        continue;
      }

      throw new Error(result.error || result.message || "Permintaan gagal.");
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("Tidak dapat terhubung ke server auth.");
    }
  }

  throw lastError || new Error("Gagal memanggil service auth.");
}

function loginPathByRole(_role: AuthApiRole) {
  return "/api/auth/login";
}

function mapRegisterBody(payload: RegisterPayload) {
  const base = {
    email: payload.email.trim(),
    password: payload.password,
  };

  if (payload.role === "vendor") {
    return {
      ...base,
      namaPerusahaan: payload.organizationName.trim(),
      nibMitra: payload.nib.trim(),
      npwpMitra: (payload.npwp || "").trim(),
      noHpMitra: (payload.phone || "").trim(),
    };
  }

  if (payload.role === "sppg") {
    return {
      ...base,
      namaSppg: payload.organizationName.trim(),
      nibSppg: payload.nib.trim(),
      picNoHp: (payload.phone || "").trim(),
    };
  }

  if (payload.role === "logistik") {
    return {
      ...base,
      namaPerusahaan: payload.organizationName.trim(),
      nibLogistik: payload.nib.trim(),
      picNoHp: (payload.phone || "").trim(),
    };
  }

  return {
    ...base,
    namaSekolah: payload.organizationName.trim(),
    npsn: (payload.npsn || "").trim(),
    jenjang: payload.jenjang || "SMA",
    picNoHp: (payload.phone || "").trim(),
  };
}

export async function login(payload: LoginPayload) {
  return postJson(loginPathByRole(payload.role), {
    role: payload.role,
    email: payload.email.trim(),
    password: payload.password,
  });
}

export async function register(payload: RegisterPayload) {
  return postJson("/api/auth/register", {
    role: payload.role,
    ...mapRegisterBody(payload),
  });
}
