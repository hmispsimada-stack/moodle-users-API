import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdlServicesService } from '../../services/mdl-services.service';
import { MdlUser } from '../../interfaces/mdl-user';
import { Users } from '../../shared/users';

@Component({
  selector: 'app-home-check',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home-check.html',
  styleUrl: './home-check.css',
})
export class HomeCheck {
  email: string | null = null;
  isValid: boolean = false;
  isValidating: boolean = false;
  // Use a FormControl for easy validation
  emailControl = new FormControl('', Validators.email);
  userData!: MdlUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mdlService: MdlServicesService,
    private usersService: Users
  ) {}

  ngOnInit(): void {
    // 1. Get the email from the route parameter
    this.route.paramMap.subscribe((params) => {
      this.email = params.get('email');
      if (this.email) {
        // 2. Set the value to the form control
        this.emailControl.setValue(this.email);
        // 3. Apply the built-in email validator
        this.emailControl.setValidators(Validators.email);
        this.emailControl.updateValueAndValidity(); // Recalculate the validation status

        // 4. Check validity
        this.isValid = this.emailControl.valid;

        if (!this.isValid) {
          console.log('Invalid email in URL, redirecting or showing error');
          // Optional: Redirect if invalid
          // this.router.navigate(['/invalid-email-error']);
        }
      } else {
        // Handle case where email parameter is missing (e.g., redirect)
        this.router.navigate(['/']);
      }
    });
    if (this.email && this.isValid) {
      // Example usage of mdlService to get user by email
      this.checkEmail();
    }
  }
  openUpdatePage() {
    this.router.navigate(['/update']);
  }

  checkEmail() {
    if (!this.emailControl.valid || !this.emailControl.value) {
      console.error('Email is invalid or empty');
      this.isValid = false;
      return;
    }
    const email = this.emailControl.value;
    this.email = email;
    this.isValid = true;
    this.mdlService.getUserByEmail(email).subscribe(
      (response) => {
        console.log('User data:', response?.users[0]);
        this.usersService.setUser(response?.users[0]);
        this.userData = response?.users[0];
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
    this.isValidating = true;
  }
}
