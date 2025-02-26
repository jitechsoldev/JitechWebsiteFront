import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // The expected roles for this route should be specified in the route's data.
    const expectedRoles = next.data['roles'] as Array<string>;

    // Retrieve the current user info from the token.
    const user = this.authService.getUserInfo();

    if (!user) {
      // No user info found; redirect to login.
      this.router.navigate(['/login']);
      return false;
    }

    // Check if the user has at least one of the expected roles.
    const hasRole = expectedRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      // Optionally redirect to an unauthorized page or show a message.
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
