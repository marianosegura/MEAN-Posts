import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { environment } from '../../environments/environment';
import { InfoMessageService } from "../header/info-message.service";
import { User } from "./user.model";

const SERVER_URL = environment.apiUrl + "/auth/";


@Injectable({ providedIn: "root" })
export class AuthService {
  private _token: string;
  
  private tokenTimer: any;  // activated by token expiration
  
  private _user: User;
  private _user$ = new Subject<User>();

  private _authError$ = new Subject<void>();  // used to stop loading in sign in/up

  constructor(
    private http: HttpClient, 
    private router: Router,
    private infoMessageService: InfoMessageService 
  ) { }
  
  signUp(username: string, email: string, password: string) {
    const authData = { username, email, password };
    return this.http.post(SERVER_URL + 'signup', authData)
      .subscribe((res) => {
        this.infoMessageService.show(`User ${username} signed up!`);
        this.router.navigate(['/auth/signin']);
      }, (error) => {
        this._authError$.next();
      });
  }

  signIn(username: string, password: string) {
    const authData = { username, password };
    this.http.post<{ token: string, expiresIn: number, userId: string }>(SERVER_URL + 'signin', authData)
      .subscribe((res) => {
        if(res.token) {
          this._token = res.token;
          this._user = { id: res.userId, username };
          this._user$.next(this._user);

          this.setTokenTimer(res.expiresIn * 1000); 
          const expirationDate = new Date(new Date().getTime() + res.expiresIn * 1000);
          this.saveLocalStorageUser(res.token, expirationDate, res.userId, username);
          
          this.infoMessageService.show(`Signed in as ${username}`);
          this.router.navigate(['/']);
        }
      }, (error) => {
        this._authError$.next();
      })
  }

  public get token() { return this._token; }
  public get user() { return this._user; }
  public get user$() { return this._user$.asObservable(); }
  public get authError$() { return this._authError$.asObservable(); }

  signOut() {
    this._token = null;
    this._user = null;
    this._user$.next(null);
    clearTimeout(this.tokenTimer);
    this.clearLocalStorageUser();
    this.infoMessageService.show(`Signed out`);
    this.router.navigate(['/']);
  }

  private saveLocalStorageUser(token: string, expirationDate: Date, userId: string, username: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
  }

  private clearLocalStorageUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('expirationDate');
  }

  tryAutoSignIn() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const expirationISOString = localStorage.getItem('expirationDate');
    if (!token || !expirationISOString || !userId || !username) return;
    
    const expirationDate = new Date(expirationISOString);
    const now = new Date();
    if (now > expirationDate) this.signOut();

    this._token = token;
    this._user = { id: userId, username };
    this.setTokenTimer(expirationDate.getTime() - now.getTime());
  }

  private setTokenTimer(duration: number) {
    this.tokenTimer = setTimeout(() => this.signOut(), duration);  // in milliseconds
  }
}