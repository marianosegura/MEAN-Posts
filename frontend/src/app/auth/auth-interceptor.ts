import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.token;
    const authRequest = req.clone({  // attach token
      headers: req.headers.set("authorization", "Bearer " + token)  // "bearer token" by convention
    });
    return next.handle(authRequest);
  }
}
