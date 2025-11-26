import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
  effect,
  OnInit,
} from '@angular/core';
import { Users } from '../../shared/users';
import { MdlUser } from '../../interfaces/mdl-user';
import { MdlServicesService } from '../../services/mdl-services.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common'; // <-- Imported JsonPipe
import { OrgUnitsService } from '../../services/org-units.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-update-user',
  imports: [ReactiveFormsModule, JsonPipe], // <-- Added JsonPipe here
  templateUrl: './update-user.html',
  styleUrl: './update-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateUser implements OnInit {
  private fb = inject(FormBuilder);
  private ouService = inject(OrgUnitsService); // Inject the new service
  private mdlService = inject(MdlServicesService);
  private usersService = inject(Users);

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
      level2: [
        {
          value: this.usersService
            .currentUser()
            ?.customfields?.filter((el) => el.shortname === 'region')[0]?.displayvalue,
        },
        Validators.required,
      ],
      level3: [
        {
          value: this.usersService
            .currentUser()
            ?.customfields?.filter((el) => el.shortname === 'district'),
          disabled: true,
        },
      ],
      level4: [
        {
          value: this.usersService
            .currentUser()
            ?.customfields?.filter((el) => el.shortname === 'commune'),
          disabled: true,
        },
      ],
      level5: [
        {
          value: this.usersService
            .currentUser()
            ?.customfields?.filter((el) => el.shortname === 'fs'),
          disabled: true,
        },
      ],
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

    console.log(
      'Curr region: ',
      this.usersService.currentUser()?.customfields?.filter((el) => el.shortname === 'region')
    );
  }

  // 5. ngOnInit to connect Form Value Changes to Selection Signals - Logic remains the same
  ngOnInit(): void {
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
  }
}
