import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FirebaseListObservable, AngularFire } from "angularfire2";
import { Router } from "@angular/router";
import { ICita, IUsuario, IPaciente, IDoctor, ISecretaria } from '../interfaces/data_structure';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthMethods } from 'angularfire2';
import { DataService } from '../interfaces/data.service';
import * as firebase from 'firebase';
@Component({
  selector: 'app-secretaria',
  templateUrl: './secretaria.component.html',
  styleUrls: ['./secretaria.component.css'],
})
export class SecretariaComponent implements OnInit {
  public userID: String;
  public error: any;
  citas: FirebaseListObservable<any[]>;
  doctores: FirebaseListObservable<any[]>;
  pacientes: FirebaseListObservable<any[]>;

  constructor(private router: Router,
    private afd: AngularFireDatabase,
    public af: AngularFire,
    private ds: DataService) {
    this.get_citas();
    this.get_doctores();
  }

  register_paciente(event, name, email, password, utype) {
    event.preventDefault();

    this.ds.registerUser(email, password).then((user) => {
      this.ds.createUser(user.uid, name, email, utype).then(() => {
        let paciente_obj: IPaciente = {
          name: name,
          email: email,
          type: utype,
          uid: user.uid
        }
        this.ds.createPaciente(user.uid, name, email, utype);
        this.router.navigate([utype]);
      })
        .catch((error) => {
          this.error = error;
        });
    })
      .catch((error) => {
        this.error = error;
        console.log(this.error);
      });
  }

  register_secretaria(event, name, email, password, utype) {
    event.preventDefault();

    this.ds.registerUser(email, password).then((user) => {
      this.ds.createUser(user.uid, name, email, utype).then(() => {
        let secretaria_obj: ISecretaria = {
          name: name,
          email: email,
          type: utype,
          uid: user.uid
        }
        this.ds.createSecretaria(user.uid, name, email, utype);
        this.router.navigate([utype]);
      })
        .catch((error) => {
          this.error = error;
        });
    })
      .catch((error) => {
        this.error = error;
        console.log(this.error);
      });
  }

  register_doctor(event, name, email, password, utype) {
    event.preventDefault();

    var prevuid = this.userID;
    this.ds.registerUser(email, password).then((user) => {
      this.ds.createUser(user.uid, name, email, utype).then(() => {
        let doctor_obj: IPaciente = {
          name: name,
          email: email,
          type: utype,
          uid: user.uid
        }
        this.ds.createDoctorSecretaria(doctor_obj, prevuid);
        this.ds.createDoctor(user.uid, name, email, utype);
        this.router.navigate([utype]);
      })
        .catch((error) => {
          this.error = error;
        });
    })
      .catch((error) => {
        this.error = error;
        console.log(this.error);
      });
  }

  crear_cita(event, nombre, fecha, hora, diagnostico, receta, comentarios) {
    event.preventDefault();
    let cita_obj: ICita = {
      nombre: nombre,
      fecha: fecha,
      hora: hora,
      diagnostico: diagnostico,
      receta: receta,
      comentarios: comentarios
    }
    this.ds.createCitaSecretaria(cita_obj, this.userID, '-KytQkr0VjhwkN-BqNik');
    this.ds.createCitaDoctor(cita_obj, '-KytQkr5LlOWfUfLH9RG');
    this.ds.createCitaPaciente(cita_obj, 'W7IZEZgy32MpISZFkeFzRVgEZld2');
  }


  get_citas() {
    this.ds.af.auth.subscribe(
      (auth) => {
        this.userID = auth.uid;
        this.citas = this.af.database.list('Secretarias/' + this.userID + '/Doctores/-KytQkr0VjhwkN-BqNik/Citas', {
          query: {
            limitToLast: 20,
            orderByKey: true
          }
        })
        return this.citas;
      });
  }

  get_doctores() {
    this.ds.af.auth.subscribe(
      (auth) => {
        this.userID = auth.uid;
        this.doctores = this.af.database.list('Secretarias/' + this.userID + '/Doctores', {
          query: {
            limitToLast: 20,
            orderByKey: true
          }
        })
        return this.doctores;
      });
  }


  actualizar_cita(event, fecha, hora, diagnostico, receta, comentarios) {
    event.preventDefault();
    this.ds.af.auth.subscribe(
      (auth) => {
        this.userID = auth.uid;
        // this.ds.updateCitaDoctor(this.userID, '-KysKLL0B71JJM3cH25Q', fecha, hora, diagnostico, receta, comentarios);
      });
    this.ds.updateCitaPaciente('awcfG0poHDeera2GDKyozOuILvg1', '-KysKLL9pRC1D40D27vb', fecha, hora, diagnostico, receta, comentarios);
  }

  ngOnInit() { }

  ngAfterViewChecked() {

  }

}
