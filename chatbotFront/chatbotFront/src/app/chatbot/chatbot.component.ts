import { Component } from '@angular/core';
import { ChatbotService } from '../services/chatbot.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent {
  userInput: string = '';
  isTyping: boolean = false;
  messages: { text: string; sender: 'user' | 'bot' }[] = [];
  currentDate: string | null = null;
  isToday: boolean = true;

  constructor(
    private chatbotService: ChatbotService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.messages.push({ text: userMessage, sender: 'user' });
    this.userInput = '';
    this.isTyping = true;
    this.chatbotService
      .askQuestion(userMessage, this.authService.loggedUserId)
      .subscribe(
        (botResponse) => {
          this.isTyping = false;
          if (botResponse.startsWith('Voici les fichiers trouvés')) {
            const lines = botResponse.split('\n');
            lines.forEach((line) => {
              this.messages.push({ text: line, sender: 'bot' });
            });
          } else {
            this.messages.push({ text: botResponse, sender: 'bot' });
          }

          const today = new Date().toISOString().split('T')[0];
          this.chatbotService.newConversationDate$.next(today);
        },
        (err) => {
          this.isTyping = false;
          this.messages.push({ text: 'Erreur du serveur', sender: 'bot' });
        }
      );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const date = params['date'];
      const today = new Date().toISOString().split('T')[0];

      if (date) {
        this.isToday = date === today;
        this.currentDate = date;
        this.loadHistoryByDate(date);
      } else {
        this.isToday = true;
        this.currentDate = today;
        this.messages = [];
      }
    });
  }

  loadHistoryByDate(date: string) {
    const userId = this.authService.loggedUserId;
    if (userId) {
      this.chatbotService.getUserHistory(userId).subscribe((data) => {
        const conversation = data.filter((item: any) =>
          item.date.startsWith(date)
        );

        this.messages = conversation.flatMap((item: any) => [
          { text: item.pattern, sender: 'user' },
          { text: item.reponse, sender: 'bot' },
        ]);
      });
    }
  }
}
