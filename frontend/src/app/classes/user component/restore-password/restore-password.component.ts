import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restore-password',
  templateUrl: './restore-password.component.html',
  styleUrls: ['./restore-password.component.css'],
})
export class RestorePasswordComponent implements OnInit {
  constructor(private service: SharedService, private router: Router) {}

  failure: boolean = false;

  form = new FormGroup({
    userName: new FormControl('', [Validators.required]),
  });

  restPassword(userName: any) {
    var val = {
      userName: userName.value.trim(),
    };

    this.service.resetPassword(val).subscribe((res) => {
      let resu = this.helperResponse(res);
      console.log(res + ' => ' + resu);

      if (resu === 'true') {
        sessionStorage.setItem('userName', val.userName);
        this.router.navigate(['reset-password']);
      } else {
        this.failure = true;
      }
    });
  }

  helperResponse(some: any) {
    if (some.message === 'false') {
      return 'false';
    } else {
      return 'true';
    }
  }
  ngOnInit(): void {}
}
