// Tab-isolated session storage
// Each browser tab gets its own independent session
// This prevents role mixing when opening consumer/professional in separate tabs

const TAB_KEY = "suvidha_tab_" + (sessionStorage.getItem("_tabId") || (() => {
  const id = Math.random().toString(36).slice(2);
  sessionStorage.setItem("_tabId", id);
  return id;
})());

export const session = {
  setToken:    (v)  => sessionStorage.setItem(`${TAB_KEY}_token`,    v),
  setUser:     (v)  => sessionStorage.setItem(`${TAB_KEY}_user`,     JSON.stringify(v)),
  setRole:     (v)  => sessionStorage.setItem(`${TAB_KEY}_role`,     v),

  getToken:    ()   => sessionStorage.getItem(`${TAB_KEY}_token`),
  getUser:     ()   => { try { return JSON.parse(sessionStorage.getItem(`${TAB_KEY}_user`) || "null"); } catch { return null; } },
  getRole:     ()   => sessionStorage.getItem(`${TAB_KEY}_role`),

  clear: () => {
    sessionStorage.removeItem(`${TAB_KEY}_token`);
    sessionStorage.removeItem(`${TAB_KEY}_user`);
    sessionStorage.removeItem(`${TAB_KEY}_role`);
  },

  // Persist remember-me username in localStorage (shared, not auth)
  setRemember: (username) => localStorage.setItem("rememberUser", JSON.stringify({ username })),
  getRemember: ()         => { try { return JSON.parse(localStorage.getItem("rememberUser") || "null"); } catch { return null; } },
  clearRemember: ()       => localStorage.removeItem("rememberUser"),
};

// Admin session is also tab-isolated
export const adminSession = {
  setToken:  (v)  => sessionStorage.setItem(`${TAB_KEY}_admin_token`, v),
  setAdmin:  (v)  => sessionStorage.setItem(`${TAB_KEY}_admin`,       JSON.stringify(v)),
  getToken:  ()   => sessionStorage.getItem(`${TAB_KEY}_admin_token`),
  getAdmin:  ()   => { try { return JSON.parse(sessionStorage.getItem(`${TAB_KEY}_admin`) || "null"); } catch { return null; } },
  clear: () => {
    sessionStorage.removeItem(`${TAB_KEY}_admin_token`);
    sessionStorage.removeItem(`${TAB_KEY}_admin`);
  },
};
