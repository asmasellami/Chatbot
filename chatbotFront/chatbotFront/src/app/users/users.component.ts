import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../model/user.model';
import { ChatbotService } from '../services/chatbot.service';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(
    private chatbotService: ChatbotService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.chatbotService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des utilisateurs');
      },
    });
  }

  deleteUser(userId: number): void {
    Swal.fire({
      title: 'Vous êtes sûr de vouloir supprimer cet utilisateur ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#1DA2B4',
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteUser(userId).subscribe(
          () => {
            this.loadUsers();
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Utilisateur supprimé avec succès !',
              confirmButtonText: 'OK',
            });
          },
          (error) => {
            console.error(
              `Erreur lors de la suppression de l'utilisateur avec ID ${userId}`,
              error
            );
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: "Erreur lors de la suppression de l'utilisateur",
              confirmButtonText: 'OK',
            });
          }
        );
      }
    });
  }

  goToUpdateForm(userId: number) {
    this.router.navigate(['/updateUser', userId]);
  }
}
