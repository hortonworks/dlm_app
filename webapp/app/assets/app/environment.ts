import {Injectable} from '@angular/core';
import {Persona} from './shared/utils/persona';

@Injectable()
export class Environment {
  persona: Persona;
  loginLink: string;
}
