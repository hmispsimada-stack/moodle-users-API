import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MdlUser, Customfield as MoodleCustomField } from '../interfaces/mdl-user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MdlServicesService {
  private apiUrl = environment.apiUrl;
  private token = environment.token;

  constructor(private http: HttpClient) {}

  getUserByEmail(email: string): Observable<any> {
    const params = new HttpParams()
      .set('wstoken', this.token)
      .set('wsfunction', 'core_user_get_users')
      .set('moodlewsrestformat', 'json')
      .set('criteria[0][key]', 'email')
      .set('criteria[0][value]', email);
    return this.http.get(this.apiUrl, { params }) as Observable<any>;
  }

  updateExistingCustomFields(userId: number, customFields: MoodleCustomField[]): Observable<any> {
    let params = new HttpParams()
      .set('wstoken', this.token)
      .set('wsfunction', 'core_user_update_users')
      .set('moodlewsrestformat', 'json')
      .set('users[0][id]', userId.toString());

    // Add each custom field with the correct parameter structure
    customFields.forEach((field, index) => {
      params = params
        .set(`users[0][customfields][${index}][type]`, field.type)
        .set(`users[0][customfields][${index}][value]`, field.value.toString());
    });

    return this.http.post(this.apiUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  updateFirstName(userId: number, firstname: string) {
    let params = new HttpParams()
      .set('wstoken', this.token)
      .set('wsfunction', 'core_user_update_users')
      .set('moodlewsrestformat', 'json')
      .set('users[0][id]', userId.toString())
      .set('users[0][firstname]', firstname);

    return this.http.post(this.apiUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  updateLastName(userId: number, lastname: string) {
    let params = new HttpParams()
      .set('wstoken', this.token)
      .set('wsfunction', 'core_user_update_users')
      .set('moodlewsrestformat', 'json')
      .set('users[0][id]', userId.toString())
      .set('users[0][lastname]', lastname);
    return this.http.post(this.apiUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}
