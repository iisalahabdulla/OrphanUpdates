import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-code-validation',
  templateUrl: './code-validation.component.html',
  styleUrls: ['./code-validation.component.css'],
})
export class CodeValidationComponent implements OnInit {
  constructor(private service: SharedService, private router: Router) {}
  incorrectCode: boolean = false;
  success: boolean = false;
  failure: boolean = false;

  form = new FormGroup({
    code: new FormControl('', [Validators.required]),
  });

  successfullyLoggedIn(token: any, callback: any) {
    localStorage.setItem('token', token.token);
    callback();
  }

  checkCode(code: any) {
    var val = {
      validation_code: code.value.trim(),
      userName: sessionStorage.getItem('userName'),
    };

    this.service.checkCode(val).subscribe((res) => {
      let resu = this.helperToGetRes(res);
      if (resu === 'false') {
        this.incorrectCode = true;
      } else {
        this.successfullyLoggedIn(res, () => {
          window.location.reload();
        });
      }
    });
  }

  helperToGetRes(some: any) {
    if (some.res === 'false') {
      return 'false';
    } else {
      return 'true';
    }
  }

  resendCode() {
    var val = {
      userName: sessionStorage.getItem('userName'),
    };

    this.service.resendCode(val).subscribe((res) => {
      if (res) {
        this.success = true;
      } else {
        this.failure = true;
      }
    });
  }

  ngOnInit(): void {
    if (localStorage.length > 0) {
      this.router.navigate(['home']);
    }
  }
}
