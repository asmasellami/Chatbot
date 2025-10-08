import { Component} from '@angular/core';
import { User } from '../model/user.model';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
})
export class ProfilComponent {
  CurrentUser: User = new User();

  originalUser: User = new User();
  hasChanges: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const id = this.authService.loggedUserId;
    this.authService.consulterUser(id).subscribe({
      next: (data) => {
        this.CurrentUser = data;
        this.CurrentUser = { ...data };
        this.originalUser = { ...data };
      },
      error: (err) => {
        console.error('Erreur chargement user', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les informations du profil.',
        });
      },
    });
  }

  checkForChanges(): void {
    this.hasChanges =
      JSON.stringify(this.CurrentUser) !== JSON.stringify(this.originalUser);
  }

  updateUser(): void {
    if (!this.hasChanges) {
      Swal.fire({
        icon: 'info',
        title: 'Aucune modification',
        text: "Aucune modification n'a été effectuée.",
      });
      return;
    }

    this.authService.updateUser(this.CurrentUser).subscribe({
      next: (updatedUser) => {
        this.originalUser = { ...updatedUser };
        this.hasChanges = false;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Profil mis à jour avec succès !',
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        const errorMessage =
          err.error?.message || 'Erreur lors de la mise à jour du profil.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
        });
        console.error(err);
      },
    });
  }
}
