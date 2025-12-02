import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MdlUser, Customfield as MoodleCustomField } from '../interfaces/mdl-user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MdlServicesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  private sendUpdateToNestJS(payload: Partial<MdlUser>): Observable<any> {
    // Angular now sends a clean JSON body to the NestJS API endpoint
    return this.http
      .put(this.apiUrl + 'update-fields', payload, {
        responseType: 'json',
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  getUserByEmail(email: string): Observable<any> {
    return this.http.get(this.apiUrl + email) as Observable<any>;
  }

  updateFirstName(userId: number, firstname: string): Observable<any> {
    return this.sendUpdateToNestJS({ id: userId, firstname });
  }

  updateLastName(userId: number, lastname: string): Observable<any> {
    return this.sendUpdateToNestJS({ id: userId, lastname });
  }

  updateExistingCustomFields(userId: number, customFields: MoodleCustomField[]): Observable<any> {
    return this.sendUpdateToNestJS({ id: userId, customfields: customFields });
  }

  updateAllUserData(payload: any): Observable<any> {
    return this.sendUpdateToNestJS(payload);
  }
}
