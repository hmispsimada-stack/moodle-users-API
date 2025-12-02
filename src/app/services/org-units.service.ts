import { inject, Injectable } from '@angular/core';
import { OrganisationUnit, OrgUnitState } from '../interfaces/ou.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrgUnitsService {
  API_URL = environment.backendApiUrl;
  private http = inject(HttpClient);

  // Observable that attempts API fetch and provides fallback on connection error (Status 0)
  getOrganisationUnits(): Observable<OrgUnitState> {
    return this.http.get<OrganisationUnit[]>(this.API_URL).pipe(
      // On successful fetch
      tap(() => console.log(`Successfully fetched data`)),
      map((data) => ({ data, loading: false, error: null })),
      // On error
      catchError((error: HttpErrorResponse) => {
        // Status 0 often indicates a CORS issue or connection failure (server not running/unreachable)
        if (error.status === 0) {
          const fallbackErrorMsg = `Connection Error (Status 0). The API is likely unreachable or blocked. Using local mock data as fallback.`;
          console.error(fallbackErrorMsg, error);
          // Return mock data so the app remains functional
          return of({
            data: [],
            loading: false,
            error: fallbackErrorMsg,
          });
        } else {
          // Handle genuine API errors (e.g., 404, 500)
          const apiErrorMsg = `API Error (${error.status}): Failed to load organization units.`;
          console.error(apiErrorMsg, error);
          return of({ data: [], loading: false, error: apiErrorMsg });
        }
      })
    );
  }
}
