// ────────────────────────────────────────────────────────────
// Session storage
//
// Previously the token, role and user were written as three separate keys into
// BOTH localStorage and sessionStorage, and readers fell back from one store to
// the other per field:
//
//     session.getRole() || localStorage.getItem("userRole")
//
// That is what produced the role mismatches: a token could be read from one
// store while the role came from the other, so the router would admit a
// consumer to /staff/* and every API call would then 403.
//
// Two rules now prevent that:
//
//   1. The session is ONE object under ONE key, read and written atomically —
//      token, role and user can never come from different places.
//   2. The role is derived from the JWT itself, so a tampered or stale stored
//      role cannot disagree with the token the server will actually see.
// ────────────────────────────────────────────────────────────

const USER_KEY = "suvidha1.session";
const ADMIN_KEY = "suvidha1.admin";
const REMEMBER_KEY = "suvidha1.remember";

/** Base64url-decodes a JWT payload. Returns null on anything unexpected. */
function decodeJwt(token) {
  try {
    const payload = String(token).split(".")[1];
    if (!payload) return null;

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** True when the token's own `exp` has passed. */
function isExpired(token) {
  const claims = decodeJwt(token);
  if (!claims?.exp) return false;
  return claims.exp * 1000 <= Date.now();
}

function read(key) {
  // sessionStorage wins so two tabs can hold different roles; localStorage is
  // the fallback that survives a reload or a freshly opened tab.
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (!parsed?.token) continue;

      // Never hand back a session whose token has already expired.
      if (isExpired(parsed.token)) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
        return null;
      }

      // Warm this tab's copy so later reads are consistent within the tab.
      if (store === localStorage) {
        try {
          sessionStorage.setItem(key, raw);
        } catch {
          // Private-mode quota; the localStorage copy still works.
        }
      }

      return parsed;
    } catch {
      // Corrupt entry — drop it rather than crashing the app.
      try {
        store.removeItem(key);
      } catch {
        // ignore
      }
    }
  }

  return null;
}

function write(key, value) {
  const raw = JSON.stringify(value);
  try {
    sessionStorage.setItem(key, raw);
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(key, raw);
  } catch {
    // ignore
  }
}

function clear(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Keys written by the pre-refactor build, cleared on first sign-in. */
const LEGACY_KEYS = ["token", "user", "userRole", "admin_token", "admin_user", "admin", "rememberUser"];

function clearLegacy() {
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  // Old per-tab keys were prefixed "suvidha_tab_<id>_".
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("suvidha_tab_") || k === "_tabId")
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// ── Consumer / staff session ───────────────────────────────

export const session = {
  /**
   * Stores a signed-in session. The role always comes from the token, so the
   * stored role and the server's view of it cannot drift apart.
   */
  start(token, user) {
    const claims = decodeJwt(token);
    write(USER_KEY, {
      token,
      role: claims?.role || user?.role || null,
      user: user || null,
      startedAt: Date.now(),
    });
    clearLegacy();
  },

  /** The whole session, or null. */
  get() {
    return read(USER_KEY);
  },

  getToken() {
    return read(USER_KEY)?.token || null;
  },

  /** Authoritative role — read from the JWT, not from a separate field. */
  getRole() {
    const current = read(USER_KEY);
    if (!current?.token) return null;
    return decodeJwt(current.token)?.role || current.role || null;
  },

  getUser() {
    return read(USER_KEY)?.user || null;
  },

  /** Merges fields into the cached user without touching the token. */
  updateUser(patch) {
    const current = read(USER_KEY);
    if (!current) return null;

    const next = { ...current, user: { ...(current.user || {}), ...patch } };
    write(USER_KEY, next);
    return next.user;
  },

  isAuthenticated() {
    return Boolean(read(USER_KEY)?.token);
  },

  clear() {
    clear(USER_KEY);
    clearLegacy();
  },

  // ── Remember-me (a username hint only, never credentials) ──
  setRemember(username) {
    try {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username }));
    } catch {
      // ignore
    }
  },
  getRemember() {
    try {
      return JSON.parse(localStorage.getItem(REMEMBER_KEY) || "null");
    } catch {
      return null;
    }
  },
  clearRemember() {
    try {
      localStorage.removeItem(REMEMBER_KEY);
    } catch {
      // ignore
    }
  },
};

// ── Admin session (separate key, same guarantees) ──────────

export const adminSession = {
  start(token, admin) {
    const claims = decodeJwt(token);
    write(ADMIN_KEY, {
      token,
      role: claims?.role || admin?.role || "admin",
      user: admin || null,
      startedAt: Date.now(),
    });
    clearLegacy();
  },

  get() {
    return read(ADMIN_KEY);
  },
  getToken() {
    return read(ADMIN_KEY)?.token || null;
  },
  getAdmin() {
    return read(ADMIN_KEY)?.user || null;
  },
  /** "admin" | "superadmin" */
  getRole() {
    const current = read(ADMIN_KEY);
    if (!current?.token) return null;
    return decodeJwt(current.token)?.role || current.role || null;
  },
  isSuperAdmin() {
    return adminSession.getRole() === "superadmin";
  },
  isAuthenticated() {
    return Boolean(read(ADMIN_KEY)?.token);
  },
  clear() {
    clear(ADMIN_KEY);
    clearLegacy();
  },

  // Legacy setter names kept so existing call sites keep working.
  setToken(token) {
    const current = read(ADMIN_KEY) || {};
    adminSession.start(token, current.user);
  },
  setAdmin(admin) {
    const current = read(ADMIN_KEY);
    if (current) write(ADMIN_KEY, { ...current, user: admin });
  },
};

export { decodeJwt };
