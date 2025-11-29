import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Users } from '../../shared/users';

@Component({
  selector: 'app-redirc',
  imports: [],
  templateUrl: './redirc.html',
  styleUrl: './redirc.css',
})
export class Redirc {
  userData = inject(Users).currentUser();
  router = inject(Router);

  updateProfile() {
    this.router.navigate(['/update']);
  }

  goToMoodle() {
    window.location.href = 'https://formation-pev.com/moodle';
  }
}
