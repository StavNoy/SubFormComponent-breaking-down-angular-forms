import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AddressSubFormComponent } from "./address-sub-form/address-sub-form.component";
import { AppComponent } from "./app.component";
import { EmployeeFormComponent } from "./employee-form/employee-form.component";
import { ContactDetailsFormComponent } from "./contact-details-form/contact-details-form.component";

@NgModule({
    declarations: [
        AddressSubFormComponent,
        AppComponent,
        ContactDetailsFormComponent,
        EmployeeFormComponent,
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
