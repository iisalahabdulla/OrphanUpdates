import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { UserRoleService } from '../../services/user-role.service';

@Component({
  selector: 'app-employee-managing',
  templateUrl: './employee-managing.component.html',
  styleUrls: ['./employee-managing.component.css'],
})
export class employeeManagingComponent implements OnInit {
  constructor(
    private service2: UserRoleService,
    private service: SharedService
  ) {
    this.userRoleStatus = this.service2.userRole();
  }

  userRoleStatus: string;
  p: number = 1;
  status: Boolean = false;
  employeeList: any = [];
  employeeList2: any = [];

  ngOnInit(): void {
    this.refreshemployeeList();
  }

  refreshemployeeList() {
    this.service.getemployeeList().subscribe((data) => {
      this.employeeList = data;
      this.employeeList2 = data;

    });
  }

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

  updateRole(data: any, role: any) {
    //preparing employee information inside the value "val"
    var val = {
      roleName: role,
      _id: data._id,
      userName: data.userName,
      userEmail: data.userEmail,
    };
    //updating employee information using services api
    if (confirm(`هل أنت متأكد من تغيير دور ${data.userName} ؟`)) {
      this.service.updateemployee(val).subscribe((res) => {});
    } else {
      this.refreshemployeeList();
    }
  }
}
