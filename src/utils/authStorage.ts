import { UserAccount, UserProfile, FoodItem, DailyLog } from '../types';

const ACCOUNTS_KEY = 'nutri_app_accounts_v1';
const CURRENT_SESSION_KEY = 'nutri_app_current_session_v1';

// Helper for simple hashing of password for client local storage security
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'pwd_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export function getRegisteredAccounts(): UserAccount[] {
  try {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getCurrentSessionUser(): UserAccount | null {
  try {
    const data = localStorage.getItem(CURRENT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentSessionUser(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

export function registerAccount(name: string, email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanEmail || !cleanName || !password) {
    return { success: false, error: 'Veuillez remplir tous les champs.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' };
  }

  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
  }

  const newAccount: UserAccount = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };

  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  setCurrentSessionUser(newAccount);

  return { success: true, user: newAccount };
}

export function loginAccount(email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'Veuillez saisir votre email et mot de passe.' };
  }

  const accounts = getRegisteredAccounts();
  const user = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'Aucun compte trouvé avec cet e-mail.' };
  }

  const hashed = hashPassword(password);
  if (user.passwordHash !== hashed) {
    return { success: false, error: 'Mot de passe incorrect.' };
  }

  setCurrentSessionUser(user);
  return { success: true, user };
}

export function logoutSession(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

// User-specific data keys
export function getUserDataKey(userId: string, prefix: string): string {
  return `${prefix}_user_${userId}`;
}
