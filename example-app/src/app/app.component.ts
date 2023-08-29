import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactDetailsFormComponent } from "./contact-details-form/contact-details-form.component";

@Component({
  selector: 'app-root',
  template: `
    <app-employee-form></app-employee-form>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
}
