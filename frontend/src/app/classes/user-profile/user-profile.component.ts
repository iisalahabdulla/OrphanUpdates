import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { UserRoleService } from '../../services/user-role.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor(
    private service2: UserRoleService,
    private service: SharedService
  ) {
    this.userRoleStatus = this.service2.userRole();
  }

  p:number = 1;
  employeeList:any = [];
  employeeList2: any = [];
  userRoleStatus: string;


  ngOnInit(): void {

  }

  refreshemployeeList(){}


  filter(text: any) {
    if (text === '') {
      this.refreshemployeeList();
    } else {
      this.employeeList = this.employeeList2.filter((res: any) => {
        return (
          res.userName.match(text) ||
          res.userEmail.match(text) ||
          res.roleName.match(text)
        );
      });
    }
  }

  updateRole(item: any , item2:any ) {

  }

}
