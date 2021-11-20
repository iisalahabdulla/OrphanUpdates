import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  
  constructor(private service: SharedService, private router: Router) {}
  incorrectCode: boolean = false;
  notMatching: boolean = false;
  notValid: boolean = false;

  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required ]),
    code: new FormControl('', [Validators.required]),
  });


  changePassword(password:any, passwordconfirm:any, code:any ){
    if (this.form.valid){
      this.notValid = false;
      if (password.value === passwordconfirm.value){
        this.notMatching = false;
        var val = {
          userPassword: password.value,
          reset_password_code: code.value.trim(),
          userName: sessionStorage.getItem("userName")
          }
      
          this.service.changePassword(val).subscribe((res) => {
            if (res){
              this.router.navigate(['login']);
            }else{
              this.incorrectCode = true;
            }
          });
      }else{
       this.notMatching = true;
      }
    }else{
      this.notValid = true;
     }
    }


  ngOnInit(): void {
  }

}
