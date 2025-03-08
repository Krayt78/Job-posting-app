import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  import { Injectable } from '@nestjs/common';
  import { SkillService } from '../skill.service';
  
  @ValidatorConstraint({ async: true })
  @Injectable()
  export class IsValidSkillConstraint implements ValidatorConstraintInterface {
    constructor(private readonly skillService: SkillService) {}
  
    async validate(value: any, args: ValidationArguments) {
      const allowedSkills = await this.skillService.getAllowedSkillNames();
      return allowedSkills.includes(value);
    }
  
    defaultMessage(args: ValidationArguments) {
      return `Skill type '$value' is not valid`;
    }
  }
  
  export function IsValidSkill(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsValidSkillConstraint,
      });
    };
  }
  