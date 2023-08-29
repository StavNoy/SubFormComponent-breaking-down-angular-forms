import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from "@angular/forms";
import { ContactDetails } from "../contact-details-form/contact-details.model";

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeFormComponent implements OnInit {
  form!: FormGroup<{
    contactDetails: FormControl<ContactDetails | undefined>,
    emergencyContact: FormControl<ContactDetails | undefined>,
  }>;


  constructor(private fb: NonNullableFormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      contactDetails: this.fb.control<ContactDetails | undefined>(undefined, Validators.required),
      emergencyContact: this.fb.control<ContactDetails | undefined>(undefined, Validators.required),
    })
  }
}
