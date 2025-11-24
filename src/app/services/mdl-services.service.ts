import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customfield as MoodleCustomField } from '../interfaces/mdl-user';

@Injectable({
  providedIn: 'root',
})
export class MdlServicesService {
  private apiUrl = 'http://localhost/webservice/rest/server.php';
  private token = 'ae30385d78c51c3035371928bb621be9';

  constructor(private http: HttpClient) {}

  updateExistingCustomFields(userId: number, customFields: MoodleCustomField[]): Observable<any> {
    let params = new HttpParams()
      .set('wstoken', this.token)
      .set('wsfunction', 'core_user_update_users')
      .set('moodlewsrestformat', 'json')
      .set('users[0][id]', userId.toString());

    // Add each custom field with the correct parameter structure
    customFields.forEach((field, index) => {
      params = params
        .set(`users[0][customfields][${index}][type]`, field.shortname)
        .set(`users[0][customfields][${index}][value]`, field.value.toString());
    });

    return this.http.post(this.apiUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}
