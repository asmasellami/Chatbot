import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChatbotService } from '../services/chatbot.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  historiqueDates: string[] = [];

  constructor(
    private chatbotService: ChatbotService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    menuToggle?.addEventListener('click', () => {
      wrapper?.classList.toggle('toggled');
    });
  }

  ngOnInit(): void {
    const userId = this.authService.loggedUserId;
    if (userId) {
      this.chatbotService.getUserHistory(userId).subscribe((data) => {
        const uniqueDates = new Set(
          data.map((item: any) => item.date?.split('T')[0])
        );
        this.historiqueDates = Array.from(uniqueDates).sort().reverse();
      });
    }

    this.chatbotService.newConversationDate$.subscribe((date) => {
      if (!this.historiqueDates.includes(date)) {
        this.historiqueDates.unshift(date);
      }
    });
  }

  goToChatbot(date: string) {
    this.router.navigate(['/chatbot'], { queryParams: { date } });
  }

  goToLastChat() {
    if (this.historiqueDates.length > 0) {
      const lastDate = this.historiqueDates[0];
      this.router.navigate(['/chatbot'], { queryParams: { date: lastDate } });
    } else {
      this.router.navigate(['/chatbot']);
    }
  }

  onLogout() {
    this.authService.logout();
  }

  deleteHistory(date: string) {
    const userId = this.authService.loggedUserId;
    if (!userId) return;

    Swal.fire({
      title: 'Supprimer cette conversation ?',
      text: 'Cela supprimera toute la conversation de cette date !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.chatbotService.deleteUserHistoryByDate(userId, date).subscribe({
          next: () => {
            this.historiqueDates = this.historiqueDates.filter(
              (d) => d !== date
            );
            Swal.fire(
              'Supprimé !',
              `Conversations du ${date} supprimées.`,
              'success'
            );
          },
          error: () => {
            Swal.fire(
              'Erreur',
              'Une erreur est survenue lors de la suppression',
              'error'
            );
          },
        });
      }
    });
  }
}
