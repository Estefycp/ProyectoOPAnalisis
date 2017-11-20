import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import { Injectable } from "@angular/core";
import {
  AngularFire, AuthProviders, AuthMethods,
  AngularFireDatabase, FirebaseListObservable,
  FirebaseObjectObservable
} from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseObjectFactoryOpts } from "angularfire2/interfaces";
import {
  ICita, Cita, IUsuario, Usuario, IDoctor, Doctor, ISecretaria, Secretaria,
  IPaciente, Paciente
} from './data_structure';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {
  private DoctorPath: string;
  private SecretariaPath: string;
  private PacientePath: string;
  private UsersPath: string;
  private CitasPath: string;
  public users: FirebaseListObservable<any>;
  public displayName: string;
  public email: string;
  public utype: string;
  public authState$: Observable<firebase.User>;
  public user: firebase.User;
  // public secondary: AngularFire;

  constructor(private afd: AngularFireDatabase,
    public af: AngularFire,
    private afAuth: AngularFireAuth) {
    this.DoctorPath = '/Doctores';
    this.SecretariaPath = '/Secretarias';
    this.PacientePath = '/Pacientes';
    this.UsersPath = '/Usuarios';
    this.CitasPath = '/Citas';
    // var firebaseConfig = {
    //   // apiKey: "AIzaSyDosWLCRwu2X9MJx5d3t--2d_Ygyp0rIWk",
    //   // authDomain: "pagina-e79fe.firebaseapp.com",
    //   // databaseURL: "https://pagina-e79fe.firebaseio.com",
    //   // projectId: "pagina-e79fe",
    //   // storageBucket: "pagina-e79fe.appspot.com",
    //   // messagingSenderId: "262086105509",

    //   apiKey: "AIzaSyBNFDf3xrGmC7AbDB8gaEavxWtjo3THvZo",
    //   authDomain: "citas-12fd1.firebaseapp.com",
    //   databaseURL: "https://citas-12fd1.firebaseio.com",
    //   projectId: "citas-12fd1",
    //   storageBucket: "citas-12fd1.appspot.com",
    //   messagingSenderId: "689432831653"
    // };
    // this.secondary = new AngularFire(firebaseConfig, this.af.auth, this.af.database);
    // firebase.initializeApp(firebaseConfig, "Secondary");
  }

  //Auth register/login/logout

  registerUser(email, password) {
    return this.af.auth.createUser({
      email: email,
      password: password
    });
  }

  loginWithEmail(email, password) {
    return this.af.auth.login({
      email: email,
      password: password,
    },
      {
        provider: AuthProviders.Password,
        method: AuthMethods.Password,
      });
  }

  logout() {
    return this.af.auth.logout();
  }


  //Crud User
  createUser(uid, name, email, utype) {
    return this.af.database.object(this.UsersPath + '/' + uid).set({
      uid: uid,
      name: name,
      email: email,
      type: utype
    });
  }
  getUser(userId: string): FirebaseObjectObservable<any> {
    return this.afd.object(this.UsersPath + '/' + userId);
  }


  //Crud doctor

  createDoctor(uid, name, email, utype) {
    return this.af.database.object(this.DoctorPath + '/' + uid).set({
      uid: uid,
      name: name,
      email: email,
      type: utype
    });
  }

  updateCitaDoctor(Did, Cid, nombre, fecha, hora, diagnostico, receta, comentarios) {
    return this.af.database.object(this.DoctorPath + '/' + Did + '/' +
      this.CitasPath + '/' + Cid).set({
        nombre: nombre,
        fecha: fecha,
        hora: hora,
        diagnostico: diagnostico,
        receta: receta,
        comentarios: comentarios
      });
  }
  createCitaDoctor(cita: Cita, doctorId: String): firebase.Promise<any> {
    return this.afd.list(this.DoctorPath + '/' + doctorId + '/' + this.CitasPath).push(cita);
  }
  cancelarCitaDoctor(did: String, cid: string){
    return this.afd.list(this.DoctorPath + '/' + did + '/' + this.CitasPath).remove(cid);
  }

  //Crud secretaria

  createSecretaria(uid, name, email, utype) {
    return this.af.database.object(this.SecretariaPath + '/' + uid).set({
      uid: uid,
      name: name,
      email: email,
      type: utype
    });
  }

  createPacienteSecretaria(paciente: Paciente, secretariaId: String): firebase.Promise<any> {
    return this.afd.list(this.SecretariaPath + '/' + secretariaId + '/' + this.PacientePath).push(paciente);
  }

  createDoctorSecretaria(doctor: Doctor, secretariaId: String): firebase.Promise<any> {
    return this.afd.list(this.SecretariaPath + '/' + secretariaId + '/' + this.DoctorPath).push(doctor);
  }

  createUserDSecretaria(user: Usuario, secretariaId: String): firebase.Promise<any> {
    return this.afd.list(this.DoctorPath).push(user);
  }
  createUserPSecretaria(user: Usuario, secretariaId: String): firebase.Promise<any> {
    return this.afd.list(this.PacientePath).push(user);
  }
  createCitaSecretaria(cita: Cita, secretariaId: String, doctorId: String): firebase.Promise<any> {
    return this.afd.list(this.SecretariaPath + '/' + secretariaId + '/' +
      this.DoctorPath + '/' + doctorId + '/' + this.CitasPath).push(cita);
  }



  //Crud paciente

  createPaciente(uid, name, email, utype) {
    return this.af.database.object(this.PacientePath + '/' + uid).set({
      uid: uid,
      name: name,
      email: email,
      type: utype
    });
  }

  updateCitaPaciente(Pid, Cid, fecha, hora, diagnostico, receta, comentarios) {
    return this.af.database.object(this.PacientePath + '/' + Pid + '/' +
      this.CitasPath + '/' + Cid).set({
        fecha: fecha,
        hora: hora,
        diagnostico: diagnostico,
        receta: receta,
        comentarios: comentarios
      });
  }
  createCitaPaciente(cita: Cita, pacienteId: String): firebase.Promise<any> {
    return this.afd.list(this.PacientePath + '/' + pacienteId + '/' + this.CitasPath).push(cita);
  }
  cancelarCitaPaciente(pid: String, cid: string){
    return this.afd.list(this.PacientePath + '/' + pid + '/' + this.CitasPath).remove(cid);
  }

}
