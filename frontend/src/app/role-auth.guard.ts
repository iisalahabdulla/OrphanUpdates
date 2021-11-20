import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserRoleService } from './services/user-role.service';

@Injectable({
  providedIn: 'root',
})
export class RoleAuthGuard implements CanActivate {
  constructor(private service: UserRoleService, private _router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.service.userRole() === next.data.role || this.service.userRole() === next.data.role2) {
      return true;
    } else {
      this._router.navigate(['/home']);
      return false;
    }
  }
}
