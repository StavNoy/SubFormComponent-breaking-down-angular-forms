This is a short example on how to declare a Component that implements `AbstractSubFormComponent`,
and how to use that Component in a form.

Declaring AbstractSubFormComponent will be covered in the rest of the article.

```ts
interface Address {
    city: string;
    street: string;
}

// ###########################

// This is the "root" form component.
// It is NOT a SubFormComponent, but just a regular Component that has a form
@Component({
    template: `
    <form [formGroup]="form">
      <input formControlName="name">
      <app-address-form formControlName="foo"></app-address-form>
    </form>
  `
})
class PersonFormComponent {
    form = new FormGroup({
        name: new FormControl(""),
        // ! Attention: here it's a FormControl whose value is an object, NOT a FormGroup  
        address: new FormControl<Address>({
            city: "Paris",
            street: "rue fortuny",
        })
    });
}

// ###########################

@Component({
    selector: "app-address-form",
    template: `
      <div [formGroup]="form">
        <select formControlName="city">
          <option *ngFor="let city of cities">{{ city }}</option>
        </select>
        <input formControlName="street">
      </div>
    `
})
class AdressFormComponent extends AbstractSubFormComponent<Address> {
    cities = ["Paris", "NewYork", "London", "Milan", "Cologne", "Tokyo"];

    // `initialValue` is the value defined in the parent FormControl,
    // in this specific case: `{ city: "Paris", street: "rue fortuny" }`
    protected setForm(initialValue: Address | null): void {
        const { city = "", street = "" } = initialValue ?? {};
        this.form = new FormGroup({
            city: new FormControl(city, Validators.required),
            street: new FormControl(street, Validators.required),
        });
    }
}

```
