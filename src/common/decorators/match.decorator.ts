import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class MatchFieldsConstraint implements ValidatorConstraintInterface {
  validate(matchField: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const field = (args.object as any)[relatedPropertyName];
    return field === matchField;
  }

  defaultMessage({ property, targetName }: ValidationArguments) {
    return `${property} and ${targetName} must match`;
  }
}

export function MatchWith(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchFieldsConstraint,
    });
  };
}
