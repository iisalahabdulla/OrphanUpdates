import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-posts',
  templateUrl: './edit-posts.component.html',
  styleUrls: ['./edit-posts.component.css'],
})
export class EditPostsComponent implements OnInit {
  data: any;
  PostsList: any = [];

  constructor(private service: SharedService, private router: Router) {}

  ngOnInit(): void {
    this.data = JSON.parse(sessionStorage.getItem('data') || '');
  }

  // we are passing the (data) as a parameter, it refers to the textarea's value. which means the body text after editing.
  updatePost(
    data: any,
    postBody: string,
    title: string,
    email: string,
    region: string
  ) {
    var val = {
      Id: data.Id,
      post_title: title.trim(),
      postbody: postBody.trim(),
      Postcongrat: data.Postcongrat,
      employee_email: email.trim(),
      CategoryName: data.CategoryName,
      employee_region: region,
      post_Image: data.post_Image,
      categoryId: data.categoryId,
    };
    this.service.updatePosts(val).subscribe((res) => {
      //send to posts-manging
      this.router.navigate(['posts-managing']);

      // console.log(val.postBody)
    });
  }

  // the data here is an object, it's the whole item to be deleted.
  deletePost(data: any) {
    if (confirm('هل أنت متأكد؟')) {
      // console.log(typeof data.id + data.id);
      this.service.deletePosts(data.Id).subscribe((res) => {
        //send to posts-manging page

        this.router.navigate(['posts-managing']);
        // console.log(data)
      });
    }
  }
}
