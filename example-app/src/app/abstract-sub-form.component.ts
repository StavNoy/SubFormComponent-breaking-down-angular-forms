// @ts-strict-ignore
import { ChangeDetectorRef, Directive, HostListener, OnDestroy, OnInit, Self, } from "@angular/core";
import { AbstractControl, ControlValueAccessor, NgControl, ValidationErrors, } from "@angular/forms";
import { of, ReplaySubject, takeUntil } from "rxjs";
import { filter, map, take } from "rxjs/operators";

/**
 * Helper class for splitting forms into components
 * (This is not the only way to do this, but it's probably easiest)
 *
 * Works with a FormControlDirective or FormControlName (reactive form), or ngModel (template drive).
 * It does NOT work with FormGroup, nor FormArray.
 *
 * Remember when relying on the component for validation, it won't validate while it isn't rendered.
 *
 * There is also currently a problem with the pristine/dirty state
 *
 * It will sync the internal form state with the parent's control
 *
 * Based on the "Composite ControlValueAccessor" from [the presentation by Kara Erickson at AngularConnect 2017](https://www.youtube.com/watch?v=CD_t3m2WMM8).
 * With help to see how it comes together thanks to
 * [woodjs/kara-erickson-forms-ngconf17](https://github.com/woodsjs/kara-erickson-forms-ngcon17/blob/master/src/app/composite-cva/composite-cva.component.ts).
 *
 * @example
 * ```ts
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="name">
 *       <ag-foo-form formControlName="foo"></ag-foo-form>
 *     </form>
 *   `
 * })
 * class ParentFormComponent {
 *   form = new FormGroup({
 *     name: new FormControl("", Validators.required),
 *     foo: new FormControl({bar: 1})
 *   });
 * }
 *
 * @Component({
 *   selector: "ag-foo-form",
 *   template: `<input type="number"
 *                     [formControl]="form.get('bar')">`
 * })
 * class FooFormComponent extends AbstractSubFormComponent<{ bar: number }> {
 *   protected setForm(initialValue: { bar: number } | null): void {
 *     const initialBar = initialValue?.bar ?? 0;
 *
 *     this.form = new FormGroup({
 *       bar: new FormControl(initialBar, Validators.min(1)),
 *     });
 *   }
 * }
 * ```
 */
@Directive()
export abstract class AbstractSubFormComponent<T>
  implements ControlValueAccessor, OnInit, OnDestroy
{
  // Partial because FormGroup values can be partial, at least while invalid.
  protected form!: AbstractControl<Partial<T>>;

  private initialValue: Partial<T> | null = null;
  private disabledOnInit = false;
  private destroy$ = new ReplaySubject<void>(1);

  /**
   * @param controlDir won't have a `control` element until ngOnInit
   *
   * @param changeDetectorRef
   * @example
   * constructor(
   *     @Self() ngControl: NgControl,
   *     changeDetectorRef: ChangeDetectorRef,
   *   ) {
   *     super(ngControl, changeDetectorRef);
   *   }
   */
  protected constructor(
    @Self() private controlDir: NgControl,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    this.controlDir.valueAccessor = this;
  }

  // Oddly, this is called before ngOnInit
  writeValue(value: Partial<T> | null): void {
    if (this.form) {
      // emitEvent: false otherwise we have an infinite loop of parent and child setting values on each other
      this.form.patchValue((value ?? {}) as T, { emitEvent: false });

      // writeValue isn't considered for change detection.
      // You'd think that's a bug, but apparently "this is working as expected":
      // https://github.com/angular/angular/issues/44976#issuecomment-1031764401
      this.changeDetectorRef.markForCheck();
    } else {
      this.initialValue = value;
    }
  }

  ngOnInit(): void {
    this.setForm(this.initialValue);
    if (this.disabledOnInit) {
      this.form.disable();
    }

    // for form groups and arrays, child errors are not included in form.errors, but ths status is updated
    const validator = (): ValidationErrors | null =>
      this.form.invalid ? this.form.errors ?? { nestedError: true } : null;

    this.controlDir.control!.addValidators(validator);
    this.controlDir.control!.addAsyncValidators(() => {
      if (!this.form.pending) {
        return of(null);
      }
      return this.form.statusChanges.pipe(
        filter((status) => status !== "PENDING"),
        take(1),
        map(validator)
      );
    });
    // Make sure the initial value is validated by this component
    this.controlDir.control!.updateValueAndValidity();

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onChange);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * You can transform the internal value to conform to the parent.
   * @example
   * ```ts
   *  override registerOnChange(fn) {
   *    super.registerOnChange(internalValue => fn({
   *      ...internalValue,
   *      prefixed-foo: internalValue.foo,
   *    }));
   *  }
   * ```
   *
   * Note: this is intended for use with UI changes, so the synced form from the parent is always set as dirty.
   * This causes issues.
   *
   * @inheritDoc
   */
  registerOnChange(fn: (value: Partial<T> | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.form) {
      isDisabled ? this.form.disable() : this.form.enable();
    } else {
      this.disabledOnInit = isDisabled;
    }
  }

  /**
   * Set `this.form`.
   * Called by default form ngOnInit(), after the hooks on ControlValueAccessor are called.
   *
   * As I understand the ControlValueAccessor lifecycle should be called after ngOnInit,
   * but that doesn't seem to work here.
   * Supposedly fixed a while back in https://github.com/angular/angular/commit/1a0ee18d62b5bbe1050ed257abd7707899af9514.
   *
   * @param initialValue is received from the parent component through ControlValueAccessor.writeValue().
   * Subsequent calls to writeValue() will patch the value directly on to this form.
   */
  protected abstract setForm(initialValue: Partial<T> | null): void;

  // Angular event for considering a form "touched" is `blur`.
  // `focusout` is essentially the same event, but will bubble up from child input elements
  @HostListener("focusout")
  private onTouched = () => {};

  private onChange: (t: Partial<T>) => void = () => {};
}
