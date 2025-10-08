import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup,Validators,} from '@angular/forms';
import { User } from '../model/user.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  public user = new User();
  confirmPassword?: string;
  myForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }
  onRegister() {
    if (this.myForm.invalid) return;

    if (this.user.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Les mots de passe ne correspondent pas !',
      });
      return;
    }

    this.authService.register(this.user).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Inscription réussie !',
          confirmButtonText: 'Aller à la page de connexion',
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        const errorMessage =
          err.error.message || err.error || "Erreur lors de l'inscription.";
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
        });
      },
    });
  }
}
