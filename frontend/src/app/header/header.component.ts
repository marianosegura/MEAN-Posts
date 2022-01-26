import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User;
  private userSub: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }
  
  ngOnInit(): void {
    this.user = this.authService.user;
    this.userSub = this.authService.user$.subscribe(
      (user) => this.user = user
    );
  }
  
  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  onSignOut() {
    this.authService.signOut();
  }

  onToUserPosts() {
    this.router.navigate(['/'], { queryParams: { userId: this.user.id } });
  }
}
