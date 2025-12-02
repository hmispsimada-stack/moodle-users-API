import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
  effect,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Users } from '../../shared/users';
import { MdlServicesService } from '../../services/mdl-services.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrgUnitsService } from '../../services/org-units.service';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';

function phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null; // Required validator handles empty state
  }

  // Regex for 10 digits starting with 03
  const regex = /^03\d{8}$/;

  if (!regex.test(value)) {
    return { invalidPhoneNumber: true };
  }

  return null;
}

@Component({
  selector: 'app-update-user',
  imports: [ReactiveFormsModule, MatAutocompleteModule, CommonModule], // <-- Added CommonModule here
  templateUrl: './update-user.html',
  styleUrl: './update-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateUser implements OnInit {
  private fb = inject(FormBuilder);
  private ouService = inject(OrgUnitsService); // Inject the new service
  private mdlService = inject(MdlServicesService);
  private usersService = inject(Users);
  private router = inject(Router);
  userRegion: string | null | undefined = '';
  userInitRegionId: string | null | undefined = '';
  userDistrict: string | null | undefined = '';
  userCommune: string | null | undefined = '';
  userFS: string | null | undefined = '';
  userPoste: string | null | undefined = '';
  userName: string | null | undefined = '';
  userFirstName: string | null | undefined = '';
  userLastName: string | null | undefined = '';
  // Signal to hold the formatted value for display in the input field
  contactDisplayValue = signal<string>('');

  // Signal to hold the result after submission
  submittedData = signal<string | null>(null);

  API_URL = environment.backendApiUrl;
  // Signal derived from API Observable using toSignal
  // It tracks data, loading, and error states.
  orgUnitState = toSignal(this.ouService.getOrganisationUnits(), {
    // Initial value before the Observable emits (i.e., when loading)
    initialValue: { data: [], loading: true, error: null },
  });

  // Computed signal that extracts just the data array for filtering
  private allUnits = computed(() => this.orgUnitState().data);

  // 2. Reactive Form Definition
  ouForm: FormGroup;

  // Signals to hold the latest *validated* selection ID from the form controls
  private level2SelectionId = signal<string | null>(null);
  private level3SelectionId = signal<string | null>(null);
  private level4SelectionId = signal<string | null>(null);
  private level5SelectionId = signal<string | null>(null);

  // Computed signals for options lists
  level2Options = computed(() => this.allUnits().filter((unit) => unit.level === 2));
  level3Options = computed(() => {
    const parentId = this.level2SelectionId();
    if (!parentId) return [];
    return this.allUnits().filter((unit) => unit.level === 3 && unit.parent_id === parentId);
  });
  level4Options = computed(() => {
    const parentId = this.level3SelectionId();
    if (!parentId) return [];
    return this.allUnits().filter((unit) => unit.level === 4 && unit.parent_id === parentId);
  });
  level5Options = computed(() => {
    const parentId = this.level4SelectionId();
    if (!parentId) return [];
    return this.allUnits().filter((unit) => unit.level === 5 && unit.parent_id === parentId);
  });

  constructor() {
    this.ouForm = this.fb.group({
      level2: ['', [Validators.required]],
      level3: [
        {
          value: '',
          disabled: true,
        },
        [Validators.required],
      ],
      level4: [
        {
          value: '',
          disabled: true,
        },
      ],
      level5: [
        {
          value: '',
          disabled: true,
        },
      ],
      name: ['', [Validators.required, Validators.minLength(2)]],
      familyName: ['', [Validators.required, Validators.minLength(2)]],
      poste: ['', [Validators.required]],
      contact: ['', [Validators.required, phoneNumberValidator]],
    });

    // 4. Effects for Cascading Logic (Enable/Disable/Reset) - Logic remains the same
    effect(() => {
      const l2Selected = this.level2SelectionId();
      const l3Control = this.ouForm.get('level3');
      const l4Control = this.ouForm.get('level4');
      const l5Control = this.ouForm.get('level5');

      if (l2Selected) {
        l3Control?.enable({ emitEvent: false });
      } else {
        l3Control?.disable({ emitEvent: false });
        l3Control?.setValue('', { emitEvent: false });
        l4Control?.disable({ emitEvent: false });
        l4Control?.setValue('', { emitEvent: false });
        l5Control?.disable({ emitEvent: false });
        l5Control?.setValue('', { emitEvent: false });
      }
    });

    effect(() => {
      const l3Selected = this.level3SelectionId();
      const l4Control = this.ouForm.get('level4');
      const l5Control = this.ouForm.get('level5');

      if (l3Selected) {
        l4Control?.enable({ emitEvent: false });
      } else {
        l4Control?.disable({ emitEvent: false });
        l4Control?.setValue('', { emitEvent: false });
        l5Control?.disable({ emitEvent: false });
        l5Control?.setValue('', { emitEvent: false });
      }
    });

    effect(() => {
      const l4Selected = this.level4SelectionId();
      const l5Control = this.ouForm.get('level5');

      if (l4Selected) {
        l5Control?.enable({ emitEvent: false });
      } else {
        l5Control?.disable({ emitEvent: false });
        l5Control?.setValue('', { emitEvent: false });
      }
    });

    // Get initial values from the user
    effect(() => {
      // Initialize form controls once data is available
      const userRegionId = this.usersService
        .currentUser()
        ?.customfields?.find((cf) => cf.shortname === 'region')
        ?.value.split('-')[0];

      if (userRegionId) {
        this.ouForm.get('level2')?.setValue(userRegionId, { emitEvent: false });
        this.level2SelectionId.set(userRegionId);
        this.userRegion = this.allUnits().find((ou) => ou.id === userRegionId)?.name;
      }

      const userDistrictId = this.usersService
        .currentUser()
        ?.customfields?.find((cf) => cf.shortname === 'district')
        ?.value.split('-')[0];
      if (userDistrictId) {
        this.ouForm.get('level3')?.setValue(userDistrictId, { emitEvent: false });
        this.level3SelectionId.set(userDistrictId);
        this.userDistrict = this.allUnits().find((ou) => ou.id === userDistrictId)?.name;
      }

      const userCommunneId = this.usersService
        .currentUser()
        ?.customfields?.find((cf) => cf.shortname === 'commune')
        ?.value.split('-')[0];
      if (userCommunneId) {
        console.log('User Commune ID: ', userCommunneId);

        this.ouForm.get('level4')?.setValue(userCommunneId, { emitEvent: false });
        this.level4SelectionId.set(userCommunneId);
        this.userCommune = this.allUnits().find((ou) => ou.id === userCommunneId)?.name;
      }

      const userFSId = this.usersService
        .currentUser()
        ?.customfields?.find((cf) => cf.shortname === 'FS')
        ?.value.split('-')[0];
      if (userFSId) {
        this.ouForm.get('level5')?.setValue(userFSId, { emitEvent: false });
        this.level5SelectionId.set(userFSId);
        this.userFS = this.allUnits().find((ou) => ou.id === userFSId)?.name;
      }
    });
  }

  get contact(): AbstractControl {
    return this.ouForm.get('contact')!;
  }

  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value;

    // 1. Sanitize: Remove all non-digit characters
    let cleanValue = rawValue.replace(/\D/g, '');

    // Limit to the required 10 digits
    if (cleanValue.length > 10) {
      cleanValue = cleanValue.substring(0, 10);
    }

    // 2. Update the form control (Model Value)
    // We use setValue({ value, emitEvent: false }) to update the model without
    // causing an infinite loop if we were using valueChanges.
    // The user input is the source of truth here.
    this.contact.setValue(cleanValue, { emitEvent: false });

    // 3. Format: Add spaces for View Value (03x xx xxx xx)
    let formattedValue = '';

    // Format based on the clean 10-digit string
    if (cleanValue.length > 0) {
      formattedValue = cleanValue.substring(0, 3);
    }
    if (cleanValue.length > 3) {
      formattedValue += ' ' + cleanValue.substring(3, 5);
    }
    if (cleanValue.length > 5) {
      formattedValue += ' ' + cleanValue.substring(5, 8);
    }
    if (cleanValue.length > 8) {
      formattedValue += ' ' + cleanValue.substring(8, 10);
    }

    // Update the signal for display in the input field
    this.contactDisplayValue.set(formattedValue);
  }

  // 5. ngOnInit to connect Form Value Changes to Selection Signals - Logic remains the same
  ngOnInit(): void {
    if (this.userInitRegionId) {
      this.ouForm.get('level2')?.setValue(this.userInitRegionId, { emitEvent: false });
      this.level2SelectionId.set(this.userInitRegionId);
    }
    // L2 -> L3 Filter Driver
    this.ouForm.get('level2')?.valueChanges.subscribe((id) => {
      this.level2SelectionId.set(id);
      // Update userRegion when level2 changes
      this.userRegion = this.allUnits().find((ou) => ou.id === id)?.name || '';
      this.ouForm.get('level3')?.setValue('');
      this.ouForm.get('level4')?.setValue('');
      this.ouForm.get('level5')?.setValue('');
    });

    // L3 -> L4 Filter Driver
    this.ouForm.get('level3')?.valueChanges.subscribe((id) => {
      this.level3SelectionId.set(id);
      // Update userDistrict when level3 changes
      this.userDistrict = this.allUnits().find((ou) => ou.id === id)?.name || '';
      this.ouForm.get('level4')?.setValue('');
      this.ouForm.get('level5')?.setValue('');
    });

    // L4 -> L5 Filter Driver
    this.ouForm.get('level4')?.valueChanges.subscribe((id) => {
      this.level4SelectionId.set(id);
      // Update userCommune when level4 changes
      this.userCommune = this.allUnits().find((ou) => ou.id === id)?.name || '';
      this.ouForm.get('level5')?.setValue('');
    });

    // Also listen to level5 changes
    this.ouForm.get('level5')?.valueChanges.subscribe((id) => {
      this.level5SelectionId.set(id);
      // Update userFS when level5 changes
      this.userFS = this.allUnits().find((ou) => ou.id === id)?.name || '';
    });

    if (this.usersService.currentUser()) {
      this.userName = this.usersService.currentUser()!.username;
      this.userFirstName = this.usersService.currentUser()!.firstname;
      this.userLastName = this.usersService.currentUser()!.lastname;
      this.userPoste = this.usersService
        .currentUser()!
        .customfields?.find((cf) => cf.shortname === 'poste')?.value;

      this.ouForm.get('name')?.setValue(this.userFirstName);
      this.ouForm.get('familyName')?.setValue(this.userLastName);
      this.ouForm.get('poste')?.setValue(this.userPoste);
    }
  }

  onSubmit() {
    if (!this.ouForm.valid) {
      console.warn('Form is invalid, cannot submit');
      return;
    }

    const userId = this.usersService.currentUser()?.id;
    if (!userId) {
      console.error('User ID not available');
      alert('Erreur: ID utilisateur non disponible');
      return;
    }

    const contactModelValue = this.ouForm.get('contact')?.value;

    // Get selected values for debugging
    const level2Value = this.ouForm.get('level2')?.value;
    const level3Value = this.ouForm.get('level3')?.value;
    const level4Value = this.ouForm.get('level4')?.value;
    const level5Value = this.ouForm.get('level5')?.value;
    const posteValue = this.ouForm.get('poste')?.value;
    const nameValue = this.ouForm.get('name')?.value;
    const familyNameValue = this.ouForm.get('familyName')?.value;

    // Build custom fields array - only include fields with values
    const customFields = [];

    if (level2Value && this.userRegion) {
      customFields.push({
        type: 'region',
        value: level2Value + '-' + this.userRegion,
      });
    }

    if (level3Value && this.userDistrict) {
      customFields.push({
        type: 'district',
        value: level3Value + '-' + this.userDistrict,
      });
    }

    if (level4Value && this.userCommune) {
      customFields.push({
        type: 'commune',
        value: level4Value + '-' + this.userCommune,
      });
    }

    if (level5Value && this.userFS) {
      customFields.push({
        type: 'FS',
        value: level5Value + '-' + this.userFS,
      });
    }

    if (posteValue) {
      customFields.push({
        type: 'poste',
        value: posteValue,
      });
    }

    if (contactModelValue) {
      customFields.push({
        type: 'contact',
        value: contactModelValue,
      });
    }

    // Build payload - only include non-empty values
    const payload: any = {
      id: userId,
    };

    if (nameValue) {
      payload.firstname = nameValue;
    }

    if (familyNameValue) {
      payload.lastname = familyNameValue;
    }

    if (customFields.length > 0) {
      payload.customfields = customFields;
    }

    // Send single request with all data
    this.mdlService.updateAllUserData(payload).subscribe({
      next: (response: any) => {
        console.log('User data updated successfully:', response);

        this.router.navigate(['/redirc']);
      },
      error: (error: any) => {
        console.error('Error updating user data:', error);
        alert('Erreur lors de la mise à jour des données.');
      },
    });
  }
}
