import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Role } from '../models/role.model';

@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  readonly appHasRole = input.required<Role | Role[]>();

  constructor() {
    effect(() => {
      const required = this.appHasRole();
      const roles = Array.isArray(required) ? required : [required];
      // Read userRoles signal so this effect re-runs when auth state changes
      this.authService.userRoles();
      const allowed = this.authService.hasAnyRole(roles);

      this.viewContainer.clear();
      if (allowed) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
