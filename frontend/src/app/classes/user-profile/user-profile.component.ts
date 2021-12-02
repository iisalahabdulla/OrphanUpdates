import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { UserRoleService } from '../../services/user-role.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @Output() refresh: EventEmitter<string> = new EventEmitter();

  constructor(
    private service2: UserRoleService,
    private service: SharedService
  ) {
    this.userRoleStatus = this.service2.userRole();
  }

  p:number = 1;
  file: any;
  userRoleStatus: string;
  userName = '';
  fullName = '';
  age = 0;
  workingStatus = '';
  cvName = '';
  attachedCV: any;
  doesUserNameExist: any = '';


  ngOnInit(): void {
    this.checkIfDataExsist();
  }

  checkIfDataExsist() {
    var token = localStorage.getItem("token") || "";
    let tokenInfo = this.getDecodedAccessToken(token);
    const userName = tokenInfo.userName;
    this.service.getAllUserProfiles().subscribe((data: any) => {
      this.doesUserNameExist = data.filter((user: any) => {
        return user.userName === userName
      })
      if(this.doesUserNameExist) {
        this.fullName = this.doesUserNameExist[0].fullName;
        this.age = this.doesUserNameExist[0].age;
        this.workingStatus = this.doesUserNameExist[0].workingStatus;
      }
    })
  }

  async addUserProfile() {
    if (this.file != undefined) {
    var token = localStorage.getItem("token") || "";
    let tokenInfo = this.getDecodedAccessToken(token);
    const userName = tokenInfo.userName;

    var val = {
      userName: userName,
      fullName: this.fullName.trim(),
      age: this.age,
      workingStatus: this.workingStatus.trim()
    };
    this.uploadPdf(val)

  }
  }

  selectedFile(event: any) {
    this.file = event.target.files[0];
  }

  async uploadPdf(val: any) {
    const formData: FormData = new FormData();
    formData.append('pdf', this.file);

    await this.service.UploadPdf(formData).subscribe((data: any) => {
      const { filename } = data
      val["attachedCV"] = filename

      this.service.addUserProfile(val).subscribe((res) => {
        //refresh the list
        this.refresh.emit();
        // set all input values to empty after submiting successfully.
        this.fullName = '';
        this.age = 0;
        this.workingStatus = '';

      });

    });
  }

  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return "Error: " + Error;
    }
  }


}
