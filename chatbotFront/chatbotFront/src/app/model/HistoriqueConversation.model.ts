export interface HistoriqueConversation {
  id: number;
  userId?: number;
  intentId?: number | null;
  pattern: string;
  reponse: string;
  date: string;
}
