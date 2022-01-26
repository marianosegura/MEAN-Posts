import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private titleService: Title
  ) {
    titleService.setTitle("MEAN Posts");  // setting title
  }
 
  ngOnInit() : void {
    this.authService.tryAutoSignIn();  // auto sign in if token in local storage
  }
}
