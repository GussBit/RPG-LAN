// Define a URL da API baseada na variável de ambiente ou usa localhost como fallback
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

// Exemplo de função para buscar jogadores
export const fetchPlayers = async () => {
  const response = await fetch(`${API_URL}/api/players`);
  return await response.json();
};