import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../model/user.model';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public loggedUser!: string;
  public isloggedIn: Boolean = false;
  public roles!: string[];
  public loggedUserId!: number;
  private helper = new JwtHelperService();

  apiURL: string = 'http://localhost:8081/chatbot';
  token!: string;

  constructor(private router: Router, private http: HttpClient) {}

  login(user: User) {
    return this.http.post<User>(this.apiURL + '/login', user, {
      observe: 'response',
    });
  }

  saveToken(jwt: string) {
    sessionStorage.setItem('jwt', jwt);
    this.token = jwt;
    this.isloggedIn = true;
    this.decodeJWT();
  }

  getToken(): string {
    return this.token;
  }

  loadToken() {
    this.token = sessionStorage.getItem('jwt')!;
    this.decodeJWT();
  }

  decodeJWT() {
    if (this.token == undefined) return;
    const decodedToken = this.helper.decodeToken(this.token);
    this.roles = decodedToken.roles;
    this.loggedUser = decodedToken.sub;
    this.loggedUserId = decodedToken.id;
  }

  isAdmin(): Boolean {
    if (!this.roles)
      //this.roles== undefiened
      return false;
    return this.roles.indexOf('ADMIN') > -1;
  }

  logout() {
    this.loggedUser = undefined!;
    this.roles = undefined!;
    this.token = undefined!;
    this.isloggedIn = false;
    sessionStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }

  setLoggedUserFromLocalStorage(login: string) {
    this.loggedUser = login;
    this.isloggedIn = !!login;
  }

  isTokenExpired(): Boolean {
    return this.helper.isTokenExpired(this.token);
  }

  deleteUser(userId: number): Observable<void> {
    const url = `${this.apiURL}/delUser/${userId}`;
    return this.http.delete<void>(url);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiURL}/updateUser`, user);
  }

  addUser(user: User) {
    return this.http.post<User>(this.apiURL + '/addUser', user);
  }

  consulterUser(id: number): Observable<User> {
    const url = `${this.apiURL}/getbyid/${id}`;
    return this.http.get<User>(`${this.apiURL}/getbyid/${id}`);
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiURL}/register`, user);
  }

  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiURL}/roles`);
  }
}
