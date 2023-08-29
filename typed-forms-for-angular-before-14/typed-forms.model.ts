import { Injectable } from "@angular/core";
import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

import { Observable } from "rxjs";

// Helper to provide basic typing to forms prior to version 14
// This is not a full version, you should add missing definitions as needed.
// There are alternatives online that might suit you better, such as https://github.com/Quramy/ngx-typed-forms

export interface TypedAbstractControl<T> extends AbstractControl {
  setValue(
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ): void;

  valueChanges: Observable<T>;

  value: T;

  setValidators(
    validators: TypedValidator<T> | TypedValidator<T>[] | null
  ): void;

  get validator(): TypedValidator<T> | null;

  get(path: string | (string | number)[]): TypedAbstractControl<unknown> | null;

  patchValue(
    value: Partial<T>,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ): void;

  reset(
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ): void;
}

interface TypedControlOptions<T> extends AbstractControlOptions {
  validators?: TypedValidator<T> | TypedValidator<T>[] | null;
  asyncValidator?: TypedAsyncValidator<T> | TypedAsyncValidator<T>[] | null;
}

type ValidatorOrOpts<T> =
  | TypedControlOptions<T>
  | TypedControlOptions<T>["validators"];

// `Omit` otherwise the common denominator for common fields is used, which is `any`, so the typing would be gone
type Overriding<Base extends object, Overrider extends object> = Overrider &
  Omit<Base, keyof Overrider>;

export interface TypedFormGroup<T extends object>
  extends Overriding<FormGroup, TypedAbstractControl<T>> {
  get<K extends keyof T>(path: K): TypedAbstractControl<T[K]> | null;

  // Overload for compatibility with FormGroup, including valid signatures which are hard to type, i.e `get('items.0.price')`
  get(path: string | (string | number)[]): TypedAbstractControl<unknown> | null;
}

export interface TypedFormArray<T>
  extends Overriding<FormArray, TypedAbstractControl<T[]>> {
  controls: TypedAbstractControl<T>[];

  push(
    control: TypedAbstractControl<T>,
    options?: {
      emitEvent?: boolean;
    }
  ): void;
}

export type TypedFormControl<T> = Overriding<
  FormControl,
  TypedAbstractControl<T>
>;

type TypedFormControlConstructorParams<T> = [
  formState?: T | { value: T; disabled?: boolean },
  validatorOrOpts?: ValidatorOrOpts<T> | null,
  asyncValidator?: TypedControlOptions<T>["asyncValidator"]
];

@Injectable({
  providedIn: "root",
})
export class TypedFormBuilder extends FormBuilder {
  override group<T extends object>(
    controlsConfig: {
      [K in keyof T]:
        | TypedAbstractControl<T[K]>
        | TypedFormControlConstructorParams<T[K]>;
    },
    validatorOrOpts?: ValidatorOrOpts<T> | null
  ): TypedFormGroup<T> {
    return super.group(controlsConfig, validatorOrOpts);
  }

  // This weird overload is needed because of the private field `_registerControl;` in FormArray.
  // TypedFormControl doesn't comply with FormArray because it's missing that field
  // and there's no way to declare it here (because it's private).
  // Better explanation as to why private and protected fields affect compatibility:
  // https://github.com/Microsoft/TypeScript/issues/18499
  override array<T>(
    controlsConfig: (
      | TypedAbstractControl<T>
      | TypedFormControlConstructorParams<T>
    )[],
    validatorOrOpts?: ValidatorOrOpts<T[]> | null
  ): TypedFormArray<T>;

  override array(
    controlsConfig: any[],
    validatorOrOpts?:
      | ValidatorFn
      | ValidatorFn[]
      | AbstractControlOptions
      | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ): FormArray;

  override array<T>(
    controlsConfig: (
      | TypedAbstractControl<T>
      | TypedFormControlConstructorParams<T>
    )[],
    validatorOrOpts?: ValidatorOrOpts<T[]> | null
  ): TypedFormArray<T> {
    return super.array(controlsConfig, validatorOrOpts);
  }

  override control<T>(
    ...params: TypedFormControlConstructorParams<T>
  ): TypedFormControl<T>;
  override control(
    ...params: Parameters<FormBuilder["control"]>
  ): FormControl;
  override control<T>(
    ...params: TypedFormControlConstructorParams<T>
  ): TypedFormControl<T> {
    return super.control(...params);
  }
}

export type TypedValidator<T> = (
  control: TypedAbstractControl<T>
) => ValidationErrors | null;
export type TypedAsyncValidator<T> = (
  control: TypedAbstractControl<T>
) => Observable<ValidationErrors | null> | Promise<ValidationErrors | null>;
