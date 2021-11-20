import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { FunctionCall } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(private service: SharedService, private router: Router) {}
  failure: boolean = false;

  form = new FormGroup({
    password: new FormControl('', [Validators.required]),
    userName: new FormControl('', [Validators.required]),
  });

  successfullyLoggedIn(token: any, callback: any) {
    localStorage.setItem('token', token.token);
    callback();
  }

  checkCredintials(userName: any, password: any) {
    var val = {
      userName: userName.value.trim(),
      userPassword: password.value,
    };

    this.service.loginToken(val).subscribe((res) => {
      let resu = this.helpGetResponse(res);
      if (resu === 'False False') {
        // show error msg
        this.failure = true;
        // set inputs value to empty
        userName.value = '';
        password.value = '';
      } else if (resu === 'True False') {
        // save val in sessionStorage
        sessionStorage.setItem('userName', val.userName);
        this.router.navigate(['code-validation']);
      } else {
        this.successfullyLoggedIn(res, () => {
          window.location.reload();
        });
      }
    });
  }

  helpGetResponse(some: any) {
    if (some.res === 'True False') {
      return 'True False';
    } else if (some.res === 'False False') {
      return 'False False';
    } else {
      return 'True True';
    }
  }

  ngOnInit(): void {
    if (localStorage.length > 0) {
      this.router.navigate(['home']);
    }
  }
}
