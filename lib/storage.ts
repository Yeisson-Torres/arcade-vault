// Persistencia mock en localStorage. Todas las operaciones toleran que el
// almacenamiento no exista o esté bloqueado (modo privado): la app sigue
// funcionando, solo que sin persistir.

export interface User {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

/** Lee la sesión guardada. Devuelve `null` si no hay, está corrupta o no se puede leer. */
export function loadUser(): User | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
    return isUser(parsed) ? { name: parsed.name } : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Sin persistencia: la sesión vive solo en memoria.
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}

/** Añade una puntuación al array `av_scores`, sellándola con la hora actual. */
export function appendScore(entry: Omit<SavedScore, "at">): void {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SCORES_KEY) ?? "[]");
    const all: SavedScore[] = Array.isArray(parsed) ? parsed : [];
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // Sin persistencia: la puntuación no se guarda.
  }
}
