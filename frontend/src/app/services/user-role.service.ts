import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';



@Injectable({
  providedIn: 'root',
})
export class UserRoleService {
  userRoleStatus: string;

  constructor() {
    //init values
    this.userRoleStatus = '';
  }

  userRole() {
    var token = localStorage.getItem("token") || "";
    let tokenInfo = this.getDecodedAccessToken(token); 
    return this.userRoleStatus = tokenInfo.role;
  }

  userName() {
    var token = localStorage.getItem("token") || "";
    let tokenInfo = this.getDecodedAccessToken(token); 
    return this.userRoleStatus = tokenInfo.unique_name;
  }


  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return "";
    }
  }
}
