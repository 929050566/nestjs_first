// import { ValidationArguments, isMobilePhone, registerDecorator } from "class-validator";
// import { isMobilePhoneLocales, IsMobilePhoneOptions, ValidationOptions } from "validator";

// /**
//  * 手机号验证规则,必须是"区域号.手机号"的形式
//  */
// export function isMatchPhone(
//     value: any,
//     locale?: isMobilePhoneLocales,
//     options?: IsMobilePhoneOptions,
// ): boolean {
//     if (!value) return false;
//     const phoneArr: string[] = value.split('.');
//     if (phoneArr.length !== 2) return false;
//     return isMobilePhone(phoneArr.join(''), locale, options);
// }

// /**
//  * 手机号验证规则,必须是"区域号.手机号"的形式
//  * @param locales 区域选项
//  * @param options isMobilePhone约束选项
//  * @param validationOptions class-validator库的选项
//  */
// export function matchPhone(
//     locales?: isMobilePhoneLocales | isMobilePhoneLocales[],
//     options?: IsMobilePhoneOptions,
//     validationOptions?: ValidationOptions,
// ) {
//     return (object: Record<string, any>, propertyName: string) => {
//         registerDecorator({
//             target: object.constructor,
//             propertyName,
//             options: validationOptions,
//             constraints: [locales || 'any', options],
//             validator: {
//                 validate: (value: any, args: ValidationArguments): boolean =>
//                     isMatchPhone(value, args.constraints[0], args.constraints[1]),
//                 defaultMessage: (_args: ValidationArguments) =>
//                     '$property must be a phone number,eg: +86.12345678901',
//             },
//         });
//     };
// }