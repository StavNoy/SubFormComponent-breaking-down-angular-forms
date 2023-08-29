import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Self } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NgControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { AbstractSubFormComponent } from "../abstract-sub-form.component";
import { Address, City } from "./address.model";

@Component({
  selector: 'app-address-sub-form',
  templateUrl: "address-sub-form.component.html",
  styleUrls: ["address-sub-form.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressSubFormComponent extends AbstractSubFormComponent<Address> {
  override form!: FormGroup<{
    city: FormControl<City>;
    street: FormControl<string>;
  }>;
  readonly City = City;

  constructor(
      @Self() controlDir: NgControl,
      changeDetectorRef: ChangeDetectorRef,
      private fb: NonNullableFormBuilder
  ) {
    super(controlDir, changeDetectorRef);
  }

  protected setForm(initialValue: Partial<Address> | null): void {
    const { city = City.Paris, street = "" } = (initialValue ?? {});

    this.form = this.fb.group({
      city: [city, Validators.required],
      street: [street, Validators.required],
    });
  }
}
