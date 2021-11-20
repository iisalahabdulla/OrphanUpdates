import { Injectable, Optional, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  //old api "you can uncomment for your webstie"
  // readonly APIUrlRole="https://jsonplaceholder.typicode.com/posts";

  // readonly baseURL = 'http://localhost:8080';
  // readonly UsersAPIUrl = 'http://localhost:8080/api/UsersApi/';
  // readonly APIUrlPost = 'http://localhost:8080/api/PostsApi';
  // readonly CategoryApi = 'http://localhost:8080/api/CategoryApi';

  readonly baseURL = 'https://localhost:44328';
  readonly UsersAPIUrl = 'http://localhost:3000/api/UsersApi';
  readonly APIUrlPost = 'https://localhost:44328/api/PostsApi';
  readonly PhotoUrl = 'http://kanzalebda3.com/articals/Uploads/';
  readonly CategoryApi = 'https://localhost:44328/api/CategoryApi';
  readonly rootURL = 'http://localhost:3000/';

  getTesting(url: string) {
    return this.http.get<any>(`${this.rootURL}getData`);
  }

  constructor(private http: HttpClient) {}

  options_ = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('token') || '',
  });

  optionsPhoto_ = new HttpHeaders({
    encrypt: 'multipart/form-data',
    Accept: 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('token') || '',
  });
  // CRUD operations for Posts

  getPostsList(): Observable<any[]> {
    return this.http.get<any>(this.APIUrlPost, { headers: this.options_ });
  }

  addPosts(val: any) {
    return this.http.post(this.APIUrlPost, val, { headers: this.options_ });
  }

  updatePosts(val: any) {
    return this.http.put(this.APIUrlPost, val, { headers: this.options_ });
  }

  deletePosts(val: any) {
    return this.http.delete(this.APIUrlPost + '/' + val, {
      headers: this.options_,
    });
  }

  UploadPhoto(val: any): Observable<any[]> {
    return this.http.post<any>(this.APIUrlPost + '/UploadFiles', val, {
      headers: this.optionsPhoto_,
    });
  }

  // Posts Category
  getAllCategoryNames() {
    return this.http.get(this.CategoryApi, { headers: this.options_ });
  }
  getCategoryDataByName(val: any) {
    return this.http.get(this.CategoryApi + '/getCategoryDataByName', val);
  }

  // shares and download counts
  downloadCountClicked(val: any) {
    return this.http.post(this.APIUrlPost + '/Downloads', val);
  }

  sharedCountClicked(val: any) {
    return this.http.post(this.APIUrlPost + '/Shares', val);
  }

  // CRUD operations for employees

  getemployeeList(): Observable<any[]> {
    return this.http.get<any>(this.UsersAPIUrl + '/GetAllEmployees', {
      headers: this.options_,
    });
  }

  addemployee(val: any) {
    // return this.http.post(this.UsersAPIUrl, val, { headers: this.options_ });
    return this.http.post(this.UsersAPIUrl, val);
  }

  updateemployee(val: any) {
    return this.http.put(this.UsersAPIUrl, val, { headers: this.options_ });
  }

  deleteemployee(val: any) {
    return this.http.delete(this.UsersAPIUrl + '/' + val, {
      headers: this.options_,
    });
  }

  // Code
  checkCode(val: any) {
    return this.http.post(this.UsersAPIUrl + '/checkCode', val);
  }

  resendCode(val: any) {
    return this.http.post(this.UsersAPIUrl + '/resendCode', val);
  }

  //password
  resetPassword(val: any) {
    return this.http.post(this.UsersAPIUrl + '/sendResetPassword', val);
  }

  changePassword(val: any) {
    return this.http.post(this.UsersAPIUrl + '/changePassword', val);
  }

  // login
  checkCredentials(val: any) {
    return this.http.post(this.UsersAPIUrl + '/CheckCredentials', val);
  }

  loginToken(val: any) {
    return this.http.post(this.UsersAPIUrl + '/login', val);
  }

  // successfullyLoggedIn(): Observable<any[]> {
  //   return this.http.get<any>(this.UsersAPIUrl);
  // }
}
