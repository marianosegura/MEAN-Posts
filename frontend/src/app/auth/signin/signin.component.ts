import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  isLoading = false;
  authErrorSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authErrorSub = this.authService.authError$.subscribe(
      () => this.isLoading = false
    );
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    const { username, password } = form.value;
    
    this.isLoading = true;
    this.authService.signIn(username, password);
  }

  ngOnDestroy(): void {
    this.authErrorSub.unsubscribe();
  }
}
