import { Component } from '@angular/core';
import { HistoriqueConversation } from '../model/HistoriqueConversation.model';
import { AuthService } from '../services/auth.service';
import { ChatbotService } from '../services/chatbot.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css'],
})
export class HistoriqueComponent {
  historique: HistoriqueConversation[] = [];
  historiqueDates: string[] = [];

  constructor(
    private chatbotService: ChatbotService,
    public authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const userId = this.authService.loggedUserId;
    if (userId) {
      this.chatbotService.getUserHistory(userId).subscribe((data) => {
        this.historique = data.map((item: any) => ({
          ...item,
          reponse: this.formatResponse(item.reponse),
        }));
        const uniqueDates = new Set(
          data.map((item: any) => item.date?.split('T')[0])
        );
        this.historiqueDates = Array.from(uniqueDates).sort().reverse();
      });
    }
  }

  goToChatbot(date: string) {
    this.router.navigate(['/chatbot'], { queryParams: { date } });
  }

  onLogout() {
    this.authService.logout();
  }

  formatResponse(response: string): string {
    if (response.startsWith('Voici les fichiers trouvés :')) {
      const lines = response.split('\n').filter((line) => line.trim());
      const header = lines[0];
      const formattedLines = lines.slice(1).map((filePath) => {
        const fileName = filePath.split('\\').pop() || 'fichier_inconnu';
        const ext = fileName.split('.').pop()?.toLowerCase() || '';

        let icon = '';
        let bgColor = '';
        switch (ext) {
          case 'pdf':
            icon = '📄';
            bgColor = '#f8d7da';
            break;
          case 'txt':
            icon = '📝';
            bgColor = '#d1ecf1';
            break;
          case 'docx':
            icon = '📃';
            bgColor = '#d4edda';
            break;
          default:
            icon = '📁';
            bgColor = '#fff3cd';
            break;
        }

        const fileUrl = this.chatbotService.getFileDownloadLink(filePath);
        const fileLink = `<a href="${fileUrl}" target="_blank" style="text-decoration:none; color:#003a73; font-weight:bold;">
                            ${icon} ${fileName}
                          </a>`;

        return `<div style="
                    background-color: ${bgColor};
                    padding: 10px 15px;
                    border-radius: 12px;
                    margin: 5px 0;
                    display:inline-block;
                    max-width: 80%;">
                    ${fileLink}
                 </div>`;
      });
      return `${header}<br>${formattedLines.join('<br>')}`;
    }
    return response;
  }

  historiqueSafe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
