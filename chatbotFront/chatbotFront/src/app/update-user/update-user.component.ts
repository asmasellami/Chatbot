import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { User } from '../model/user.model';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css'],
})
export class UpdateUserComponent {
  userToUpdate: User = new User();
  roles: string[] = [];
  selectedRole: string = '';

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService
      .consulterUser(this.activatedRoute.snapshot.params['id'])
      .subscribe({
        next: (user) => {
          this.userToUpdate = user;
          this.selectedRole =
            user.roles && user.roles.length > 0 ? user.roles[0].role : '';
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Erreur lors du chargement de l'utilisateur",
            confirmButtonText: 'OK',
          });
        },
      });

    this.authService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des rôles',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  updateUser(form: NgForm) {
    if (!form.valid) {
      this.toastr.error('Veuillez remplir correctement le formulaire.');
      return;
    }

    if (this.selectedRole) {
      this.userToUpdate.roles = [{ role: this.selectedRole }];
    } else {
      this.userToUpdate.roles = [];
    }

    this.authService.updateUser(this.userToUpdate).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Utilisateur modifié avec succès !',
          confirmButtonText: 'OK',
        });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        const errorText =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Erreur lors de la modification';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorText,
          confirmButtonText: 'OK',
        });
      },
    });
  }
}
