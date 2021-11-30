import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StatisticsComponent } from './classes/statistics/statistics.component';
import { PostDetailsComponent } from './classes/post-details/post-details.component';
import { PostsManagingComponent } from './classes/posts-managing/posts-managing.component';
import { employeeManagingComponent } from './classes/employee-managing/employee-managing.component';
import { PostsBoardComponent } from './classes/posts-board/posts-board.component';
import { EditPostsComponent } from './classes/posts-managing/edit-posts/edit-posts.component';
import { RoleAuthGuard } from '../app/role-auth.guard';
import { LoginComponent } from './classes/user component/login/login.component';
import { RegisterComponent } from './classes/user component/register/register.component';
import { CodeValidationComponent } from './classes/user component/code-validation/code-validation.component';
import { RestorePasswordComponent } from './classes/user component/restore-password/restore-password.component';
import { ResetPasswordComponent } from './classes/user component/reset-password/reset-password.component';
import { UserProfileComponent } from './classes/user-profile/user-profile.component';

const routes: Routes = [
  {
    path: 'statistics',
    component: StatisticsComponent,
    data: { role: 'مدير النظام' },
    canActivate: [RoleAuthGuard],
  },
  { path: 'details', component: PostDetailsComponent },
  {
    path: 'posts-managing',
    component: PostsManagingComponent,
    data: { role: 'منسق' },
    canActivate: [RoleAuthGuard],
  },
  {
    path: 'employee-managing',
    component: employeeManagingComponent,
    data: { role: 'مشرف', role2: 'مدير النظام'  },
    canActivate: [RoleAuthGuard],
  },{
    path: 'user-profile',
    component: UserProfileComponent,
    data: { role: 'مدير النظام', role2: 'مشرف', role3: 'منسق' , role4: 'عضو'},
    canActivate: [RoleAuthGuard]
  },
  { path: 'home', component: PostsBoardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'restore-password', component: RestorePasswordComponent },
  { path: 'code-validation', component: CodeValidationComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  {
    path: 'edit-post',
    component: EditPostsComponent,
    data: { role: 'منسق' },
    canActivate: [RoleAuthGuard],
  },

  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
