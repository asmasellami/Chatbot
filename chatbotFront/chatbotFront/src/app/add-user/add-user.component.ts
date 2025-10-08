import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../model/user.model';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
})
export class AddUserComponent {
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  emailExistsError = false;
  roles: string[] = [];
  selectedRole: string = '';

  onAddUser(form: NgForm) {
    this.emailExistsError = false;

    if (!form.valid) {
      this.toastr.error('Veuillez remplir correctement le formulaire.');
      return;
    }

    const newUser: User = new User();
    newUser.username = form.value.username;
    newUser.email = form.value.email;
    newUser.password = form.value.password;
    newUser.roles = form.value.roles;
    newUser.enabled = false;

    this.authService.addUser(newUser).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Utilisateur ajouté avec succès !',
          confirmButtonText: 'OK',
        });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        const errorText =
          typeof err.error === 'string'
            ? err.error
            : err.error.message || 'Erreur';
        if (errorText.includes('email')) {
          this.emailExistsError = true;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorText,
            confirmButtonText: 'OK',
          });
        }
      },
    });
  }

  ngOnInit(): void {
    this.authService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rôles', err);
      },
    });
  }
}
