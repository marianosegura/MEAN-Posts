import { Injectable } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: "root" })
export class InfoMessageService {
  constructor(private snackBar: MatSnackBar) { }

  show(message: string) {
    this.snackBar.open('ℹ ' + message, 'ok', { 
      duration: 4000,  // last 4 seconds 
      panelClass: ['mat-toolbar', 'mat-accent', 'info-snackbar']  // info-snackbar used to make ok button white
    });
  }
}