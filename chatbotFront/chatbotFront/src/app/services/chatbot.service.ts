import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, Subject } from 'rxjs';
import { Fichier } from '../model/file.model';
import { Intent } from '../model/intent.model';
import { User } from '../model/user.model';
import { HistoriqueConversation } from '../model/HistoriqueConversation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8081/chatbot/api/ask';
  newConversationDate$ = new Subject<string>();

  constructor(private http: HttpClient, private authService: AuthService) {}

  askQuestion(question: string, userId: number): Observable<string> {
    const body = {
      question: question,
      user_id: userId,
    };

    return this.http
      .post(this.apiUrl, body, { responseType: 'text' as const })
      .pipe(
        catchError((err) => {
          console.error('Erreur chatbot:', err);
          return of('Erreur lors de la communication avec le chatbot.');
        })
      );
  }

  private api = 'http://localhost:8081/chatbot/api';

  getAllFiles(): Observable<Fichier[]> {
    return this.http.get<Fichier[]>(`${this.api}/files`);
  }

  uploadFile(fichier: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', fichier);
    return this.http.post(`${this.api}/import-intents`, formData);
  }

  deleteFile(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/delete-file/${id}`);
  }

  updateFile(id: number, fichier: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', fichier);
    return this.http.put(`${this.api}/update-file/${id}`, formData, {
      responseType: 'text',
    });
  }

  getFileContent(id: number): Observable<string> {
    return this.http.get(`${this.api}/file-content/${id}`, {
      responseType: 'text',
    });
  }

  getAllIntents(): Observable<Intent[]> {
    return this.http.get<Intent[]>(`${this.api}/intents`);
  }

  deleteIntent(id: number): Observable<any> {
    return this.http.delete(`${this.api}/intents/${id}`);
  }

  deleteAllIntents(): Observable<any> {
    return this.http.delete(`${this.api}/intents`);
  }

  updateIntent(id: number, intent: any): Observable<any> {
    return this.http.put(`${this.api}/intents/${id}`, intent);
  }

  updateAllIntents(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.api}/intents`, formData);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:8081/chatbot/all');
  }

  getUserHistory(userId: number): Observable<HistoriqueConversation[]> {
    return this.http.get<HistoriqueConversation[]>(
      `${this.api}/historique/${userId}`
    );
  }

  getAllHistory(): Observable<HistoriqueConversation[]> {
    return this.http.get<HistoriqueConversation[]>(`${this.api}/historique`);
  }

  deleteUserHistoryByDate(userId: number, date: string): Observable<any> {
    return this.http.delete(`${this.api}/historique/${userId}/${date}`, {
      responseType: 'text',
    });
  }

  getFileDownloadLink(filePath: string): string {
    return `${this.api}/download-file?path=${encodeURIComponent(filePath)}`;
  }
}
