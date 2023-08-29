import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Self } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  NgControl,
  NonNullableFormBuilder,
  Validators
} from "@angular/forms";
import { AbstractSubFormComponent } from "../abstract-sub-form.component";
import { Address } from "../address-sub-form/address.model";
import { ContactDetails } from "./contact-details.model";

@Component({
  selector: 'app-contact-details-form',
  templateUrl: './contact-details-form.component.html',
  styleUrls: ['contact-details-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactDetailsFormComponent extends AbstractSubFormComponent<ContactDetails> {
  protected override form!: FormGroup<{
    name: FormControl<string>,
    address: FormControl<Address | undefined>,
  }>;

  constructor(
      @Self() controlDir: NgControl,
      changeDetectorRef: ChangeDetectorRef,
      private fb: NonNullableFormBuilder
  ) {
    super(controlDir, changeDetectorRef);
  }

  protected setForm(initialValue: Partial<ContactDetails> | null): void {
    const { name = "", address } = initialValue ?? {};
    this.form = this.fb.group({
      name: this.fb.control(name, Validators.required),
      address: this.fb.control<Address | undefined>(address, Validators.required),
    });
  }
}
