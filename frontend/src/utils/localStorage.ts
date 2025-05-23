export const saveToLocal = (key: string, value: any) =>
  localStorage.setItem(key, JSON.stringify(value));

export const loadFromLocal = (key: string) => {
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    // Se non è JSON valido, restituisci la stringa grezza (compatibilità vecchi dati)
    return data;
  }
};

export const removeFromLocal = (key: string) => localStorage.removeItem(key);
