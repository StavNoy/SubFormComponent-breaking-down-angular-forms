[//]: # (import { ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';)
[//]: # (import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';)

```ts

@Component({
  selector: 'my-app',
  template: `
    <ag-increment-btn  [formControl]="form"></ag-increment-btn>
    <pre>value in form: {{form.value}}</pre>
  `
})
export class AppComponent  {
  form = new FormControl(2);
}


@Component({
  selector: 'ag-increment-btn',
  template: `
  <button (click)="increment()"
    (onTouch)="onTouch()"
    [disabled]="disabled"
  >
    {{value}}
  </button>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IncrementComponent),
      multi: true
    }
  ]
})
export class IncrementComponent implements ControlValueAccessor {
  value = 0;
  onChange = (_newValue: number) => undefined;
  onTouch = () => undefined;
  disabled = false;

  increment() {
    this.value++;
    this.onChange(this.value);
  }

  writeValue(value): void {
    this.value = value;
  }

  registerOnChange(fn): void {
    this.onChange = fn;
  }

  registerOnTouched(fn): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

```
