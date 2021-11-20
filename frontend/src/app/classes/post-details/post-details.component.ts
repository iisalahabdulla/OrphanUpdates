import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { UserRoleService } from '../../services/user-role.service';
import domtoimage from 'dom-to-image';
// @ts-ignore
import { changeDpiDataUrl } from 'changedpi';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css'],
})
export class PostDetailsComponent {
  userName: any = '';
  userTitle: any = '';
  data: any;
  userRoleStatus: string;

  ngOnInit(): void {
    this.data = JSON.parse(sessionStorage.getItem("data") || "")
  }

  constructor( private elementRef: ElementRef, private service: SharedService, private roleService: UserRoleService) {
    this.elementRef = elementRef;
    this.userRoleStatus = this.roleService.userRole();
  }

  public shareCount(): void {
    var val = {
      Id: this.data.Id
    };
    this.service.sharedCountClicked(val).subscribe((res) => {});
  }

  public generateCard(target: any): void {
    var val = {
      Id: this.data.Id
    };
    this.service.downloadCountClicked(val).subscribe((res) => {});


    var link = this.elementRef.nativeElement.querySelector('#link');
    var input = this.elementRef.nativeElement.querySelector('#input');
    var input2 = this.elementRef.nativeElement.querySelector('#input2');

    const el = target;
    const BASE_DPI = 72;
    const scale = 2;

    if (target.classList.contains("congrats-form2")){
      input.classList.remove("dis");
      input2.classList.remove("dis");  
    }
    
    domtoimage.toPng(el, {
      height: el.offsetHeight * scale,
      width: el.offsetWidth * scale,
      filter: (node: any) => node.tagName !== "INPUT",
      style: {
        margin: 0,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${el.offsetWidth}px`,
        height: `${el.offsetHeight}px`
      }
    })
    .then(function (dataUrl:any) {
      input.classList.add("dis");
      input2.classList.add("dis");
      var dataUr = changeDpiDataUrl(dataUrl, BASE_DPI * scale);
      link.setAttribute('download', 'Congrats.png');
      link.setAttribute('href',dataUr);
      link.click();

    })
    .catch(function (error:any) {
        console.error('oops, something went wrong!', error);
    });
  }
}
