const TOKEN_KEY = "accessToken";

// ============================================
// SET TOKEN
// ============================================

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// ============================================
// GET TOKEN
// ============================================

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// ============================================
// REMOVE TOKEN
// ============================================

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
