import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './classes/header/header.component';
import { FooterComponent } from './classes/footer/footer.component';
import { employeeManagingComponent } from './classes/employee-managing/employee-managing.component';
import { PostsManagingComponent } from './classes/posts-managing/posts-managing.component';
import { AddPostsComponent } from './classes/posts-managing/add-posts/add-posts.component';
import { EditPostsComponent } from './classes/posts-managing/edit-posts/edit-posts.component';
import { PostDetailsComponent } from './classes/post-details/post-details.component';
import { PostsBoardComponent } from './classes/posts-board/posts-board.component';
import { StatisticsComponent } from './classes/statistics/statistics.component';
import { SharedService } from './services/shared.service';
import { UserRoleService } from './services/user-role.service';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { LoginComponent } from './classes/user component/login/login.component';
import { RegisterComponent } from './classes/user component/register/register.component';
import { CodeValidationComponent } from './classes/user component/code-validation/code-validation.component';
import { RestorePasswordComponent } from './classes/user component/restore-password/restore-password.component';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxSpinnerModule } from "ngx-spinner";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ResetPasswordComponent } from './classes/user component/reset-password/reset-password.component';
import { UserProfileComponent } from './classes/user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    employeeManagingComponent,
    PostsManagingComponent,
    PostDetailsComponent,
    PostsBoardComponent,
    StatisticsComponent,
    AddPostsComponent,
    EditPostsComponent,
    LoginComponent,
    RegisterComponent,
    CodeValidationComponent,
    RestorePasswordComponent,
    ResetPasswordComponent,
    UserProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    NgxPaginationModule,
    InfiniteScrollModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
  ],
  providers: [SharedService, UserRoleService],
  bootstrap: [AppComponent],
})
export class AppModule {}
