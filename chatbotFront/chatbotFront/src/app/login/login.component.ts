import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../model/user.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  user = new User();
  err = 0;

  constructor(private authService: AuthService, private router: Router) {}

  onLoggedin() {
    this.authService.login(this.user).subscribe({
      next: (data) => {
        const jwtToken = data.headers.get('Authorization')!;
        this.authService.saveToken(jwtToken);

        if (this.authService.isAdmin()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/chatbot']);
        }
      },
      error: () => {
        this.err = 1;
      },
    });
  }
}
