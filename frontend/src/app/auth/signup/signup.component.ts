import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
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
    const { username, email, password } = form.value;
    
    this.isLoading = true;
    this.authService.signUp(username, email, password);
  }

  ngOnDestroy(): void {
    this.authErrorSub.unsubscribe();
  }
}
