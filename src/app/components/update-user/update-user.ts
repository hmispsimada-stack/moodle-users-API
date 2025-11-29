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
import { MdlUser } from '../../interfaces/mdl-user';
import { MdlServicesService } from '../../services/mdl-services.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common'; // <-- Imported JsonPipe
import { OrgUnitsService } from '../../services/org-units.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-update-user',
  imports: [ReactiveFormsModule, MatAutocompleteModule], // <-- Added JsonPipe here
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
      name: [''],
      familyName: [''], // Just for display purpose
      poste: ['', Validators.required],
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
        console.log('User Region ID: ', userRegionId);

        this.ouForm.get('level2')?.setValue(userRegionId, { emitEvent: false });
        this.level2SelectionId.set(userRegionId);
        this.userRegion = this.allUnits().find((ou) => ou.id === userRegionId)?.name;
      }

      const userDistrictId = this.usersService
        .currentUser()
        ?.customfields?.find((cf) => cf.shortname === 'district')
        ?.value.split('-')[0];
      if (userDistrictId) {
        console.log('User District ID: ', userDistrictId);

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
        console.log('User Commune ID: ', userFSId);

        this.ouForm.get('level5')?.setValue(userFSId, { emitEvent: false });
        this.level5SelectionId.set(userFSId);
        this.userFS = this.allUnits().find((ou) => ou.id === userFSId)?.name;
      }
    });
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
      this.ouForm.get('level3')?.setValue('');
      this.ouForm.get('level4')?.setValue('');
      this.ouForm.get('level5')?.setValue('');
    });

    // L3 -> L4 Filter Driver
    this.ouForm.get('level3')?.valueChanges.subscribe((id) => {
      this.level3SelectionId.set(id);
      this.ouForm.get('level4')?.setValue('');
      this.ouForm.get('level5')?.setValue('');
    });

    // L4 -> L5 Filter Driver
    this.ouForm.get('level4')?.valueChanges.subscribe((id) => {
      this.level4SelectionId.set(id);
      this.ouForm.get('level5')?.setValue('');
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
    if (this.ouForm.valid) {
      this.mdlService
        .updateExistingCustomFields(this.usersService.currentUser()!.id, [
          {
            type: 'region',
            value: this.ouForm.get('level2')?.value + '-' + this.userRegion,
          },
          {
            type: 'district',
            value: this.ouForm.get('level3')?.value + '-' + this.userDistrict,
          },
          { type: 'commune', value: this.ouForm.get('level4')?.value + '-' + this.userCommune },
          { type: 'FS', value: this.ouForm.get('level5')?.value + '-' + this.userFS },
          { type: 'poste', value: this.ouForm.get('poste')?.value },
        ])
        .subscribe(
          (response) => {
            console.log('Custom fields updated successfully:', response);
            alert('Mise à jour effectuée avec succès!');
          },
          (error) => {
            console.error('Error updating custom fields:', error);
            alert("Une erreur s'est produite lors de la mise à jour.");
          }
        );
    }
    this.mdlService
      .updateFirstName(this.usersService.currentUser()!.id, this.ouForm.get('name')?.value)
      .subscribe(
        (response) => {
          console.log('First name updated successfully:', response);
        },
        (error) => {
          console.error('Error updating first name:', error);
        }
      );
    this.mdlService
      .updateLastName(this.usersService.currentUser()!.id, this.ouForm.get('familyName')?.value)
      .subscribe(
        (response) => {
          console.log('Last name updated successfully:', response);
        },
        (error) => {
          console.error('Error updating last name:', error);
        }
      );
    // window.location.href = 'https://formation-pev.com/moodle/login/index.php';
  }
}
