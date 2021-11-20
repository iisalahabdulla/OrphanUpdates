import { Component, OnInit } from '@angular/core';
import { UserRoleService } from '../../services/user-role.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  //making user role status for each button 'admin, supervisor, editor'
  userRoleStatus: string;
  userName: string;

  constructor(
    private service: UserRoleService,
    private sharedTesting: SharedService
  ) {
    this.userRoleStatus = this.service.userRole();
    this.userName = this.service.userName();
    this.getTesting();
  }

  getTesting() {
    this.sharedTesting.getTesting('getData').subscribe((data) => {
      console.log(data);
    });
  }
  exit() {
    localStorage.clear();
  }

  ngOnInit(): void {}
}
