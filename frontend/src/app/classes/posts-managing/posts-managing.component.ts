import { Component, OnInit, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-posts-managing',
  templateUrl: './posts-managing.component.html',
  styleUrls: ['./posts-managing.component.css'],
})
export class PostsManagingComponent implements OnInit {
  constructor(private service: SharedService) {}

  PostsList: any = [];
  status: Boolean = false;

  saveData(data:any){
    sessionStorage.setItem('data', JSON.stringify(data));
  }

  ngOnInit(): void {
    this.refreshPostsList();
  }

  refreshPostsList() {
    this.service.getPostsList().subscribe((data) => {
      this.PostsList = data;
    });
  }
}
