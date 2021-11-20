import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(private service: SharedService, private router: Router) {}

  form = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
    Email: new FormControl('', [Validators.required, Validators.email]),
  });

  emailDomainValidator(control: FormControl) {
    let email = control.value;
    if (email && email.indexOf('@') != -1) {
      let [_, domain] = email.split('@');
      if (domain !== 'tvtc.gov.sa') {
        return {
          emailDomain: {
            parsedDomain: domain,
          },
        };
      }
    }
    return null;
  }

  addNewUser(email: any, password: any) {
    var val = {
      userName: email.value.split('@')[0].trim(), //it will take the first part of email as username,
      userEmail: email.value.trim(),
      userPassword: password.value,
    };
    // console.log(val);

    this.service.addemployee(val).subscribe((res) => {
      sessionStorage.setItem('userName', val.userName);
      this.router.navigate(['code-validation']);
    });
  }

  ngOnInit(): void {}
}
