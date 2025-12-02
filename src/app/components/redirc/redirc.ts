import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Users } from '../../shared/users';

import { MdlServicesService } from '../../services/mdl-services.service';

@Component({
  selector: 'app-redirc',
  imports: [],
  templateUrl: './redirc.html',
  styleUrl: './redirc.css',
})
export class Redirc {
  user = inject(Users);
  userData = this.user.currentUser();
  router = inject(Router);
  mdlService = inject(MdlServicesService);

  updateProfile() {
    this.mdlService.getUserByEmail(this.user.currentUser()!.email).subscribe({
      next: (response) => {
        this.user.setUser(response.users[0]);
        this.router.navigate(['/update']);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      },
    });
  }

  goToMoodle() {
    window.location.href = 'https://formation-pev.com/moodle';
  }
}
