export interface ICita{
  $key?: string;
  nombre:string;
  fecha:string;
  hora:string;
  diagnostico:string;
  receta:string;
  comentarios:string;
}

export class Cita implements ICita {
  nombre:string;
  fecha:string;
  hora:string;
  diagnostico:string;
  receta:string;
  comentarios:string;
}

export interface IUsuario{
  $key?: string;
  name:string;
  email:string;
  type:string;
  uid: string;
}

export class Usuario implements IUsuario {
  name:string;
  email:string;
  type:string;
  uid: string;
}

export interface IDoctor{
  $key?: string;
  name:string;
  email:string;
  type:string;
  uid: string;
}

export class Doctor implements IDoctor {
  name:string;
  email:string;
  type:string;
  uid: string;
}

export interface ISecretaria{
  $key?: string;
  name:string;
  email:string;
  type:string;
  uid: string;
}

export class Secretaria implements ISecretaria {
  name:string;
  email:string;
  type:string;
  uid: string;
}

export interface IPaciente{
  $key?: string;
  name:string;
  email:string;
  type:string;
  uid: string;
}

export class Paciente implements IPaciente {
  name:string;
  email:string;
  type:string;
  uid: string;
}
