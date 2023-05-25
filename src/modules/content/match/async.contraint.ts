import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

type NewType = ValidationArguments;

@ValidatorConstraint({ name: 'Test', async: true })
export class TestConstraint implements ValidatorConstraintInterface {

    async validate(value: string, args: NewType) {
      // ...
      return true
    }

    defaultMessage(args: ValidationArguments) {
       // ...
       return "异步验证"
    }
}3