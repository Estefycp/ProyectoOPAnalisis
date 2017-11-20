import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FirebaseListObservable, AngularFire } from "angularfire2";
import { Router } from "@angular/router";
import { ICita, IUsuario, IPaciente } from '../interfaces/data_structure';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthMethods } from 'angularfire2';
import { DataService } from '../interfaces/data.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, AfterViewChecked {
  public userID: String;
  public error: any;
  citas: FirebaseListObservable<any[]>;
  public cita: ICita;
  public cid: string;

  constructor(
    private router: Router,
    private afd: AngularFireDatabase,
    public af: AngularFire,
    private ds: DataService) {
    this.get_citas();
    this.cita = {
      nombre: '',
      fecha: '',
      hora: '',
      diagnostico: '',
      receta: '',
      comentarios: ''
    };
    this.cid = '';
  }

  register(event, name, email, password, utype) {
    event.preventDefault();
    this.ds.registerUser(email, password).then((user) => {
      this.ds.createUser(user.uid, name, email, utype);
      this.ds.createPaciente(user.uid, name, email, utype).then(() => {
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

  crear_cita(event, nombre: string, fecha: string, hora: string, diagnostico: string, receta: string, comentarios: string) {
    event.preventDefault();
    var today = new Date();
    var now = [today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes()];

    var fechal = fecha.split('/');
    var validfecha = fechal.length == 3 &&
      +fechal[0] > 0 &&
      +fechal[0] <= 31 &&
      +fechal[1] > 0 &&
      +fechal[1] <= 12 &&
      +fechal[2] > 0;
    var horal = hora.split(':');
    var validhora = horal.length == 2 &&
      +horal[0] > 0 &&
      +horal[0] < 24 &&
      +horal[1] >= 0 &&
      +horal[1] < 60;
    if (!validfecha || !validhora) {
      alert('Hora o fecha no validos.');
      return;
    }
    var cfecha = [+fechal[2], +fechal[1], +fechal[0], +horal[0], +horal[1]];
    for(var i = 0; cfecha.length; ++i){
      if(cfecha[i] - now[i] > 0){
        break;
      }
      else if(cfecha[i] - now[i] < 0){
        alert('Fecha pasada.');
        return;
      }
    }

    var repflag = false;
    this.af.database.list('Doctores/' + this.userID + '/Citas', {
      query: {
        orderByChild: 'fecha'
      }
    }).subscribe(res => {
      // console.log(res);
      if (!repflag) {
        repflag = true;
        var used = false;
        for (var i = 0; i < res.length; ++i) {
          if ((res[i].$key != this.cid) && (res[i].fecha == fecha) && (res[i].hora == hora)) {
            used = true;
          }
        }
        // console.log(used);
        if (!used) {
          let cita_obj: ICita = {
            nombre: nombre,
            fecha: fecha,
            hora: hora,
            diagnostico: diagnostico,
            receta: receta,
            comentarios: comentarios
          }
          var done = false;
          // var paciente: string = '-1';
          var hi = this.af.database.list('Pacientes', {
            query: {
              orderByChild: 'name',
              equalTo: nombre,
              limitToFirst: 1
            }
          }).forEach(res => {
            // console.log(res);
            // console.log(res[0].$key);
            if (!done) {
              // paciente = res[0].$key
              this.ds.createCitaPaciente(cita_obj, res[0].$key).then((res) => {
                // alert('RES: ' + res.key);
                this.ds.af.auth.subscribe(
                  (auth) => {
                    this.userID = auth.uid;
                    this.ds.updateCitaDoctor(this.userID, res.key, nombre, fecha, hora, diagnostico, receta, comentarios);
                  });
              });
              done = true;
            }
          }).catch((error) => {
            alert('No se encontro el paciente.');
          });
        }
      }
    });
  }


  get_citas() {
    this.ds.af.auth.subscribe(
      (auth) => {
        this.userID = auth.uid;
        this.citas = this.af.database.list('Doctores/' + this.userID + '/Citas', {
          query: {
            limitToLast: 20,
            // orderByKey: true
            orderByChild: 'fecha'
          }
        })
        return this.citas;
      });
  }

  actualizar_cita(event, fecha: string, hora: string, diagnostico: string, receta: string, comentarios: string) {
    event.preventDefault();
    var today = new Date();
    var now = [today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes()];

    var fechal = fecha.split('/');
    var validfecha = fechal.length == 3 &&
      +fechal[0] > 0 &&
      +fechal[0] <= 31 &&
      +fechal[1] > 0 &&
      +fechal[1] <= 12 &&
      +fechal[2] > 0;
    var horal = hora.split(':');
    var validhora = horal.length == 2 &&
      +horal[0] > 0 &&
      +horal[0] < 24 &&
      +horal[1] >= 0 &&
      +horal[1] < 60;
    if (!validfecha || !validhora || this.cid == '' || this.cita == null) {
      alert('Hora o fecha no validos.');
      return;
    }
    var cfecha = [+fechal[2], +fechal[1], +fechal[0], +horal[0], +horal[1]];
    for(var i = 0; cfecha.length; ++i){
      if(cfecha[i] - now[i] > 0){
        break;
      }
      else if(cfecha[i] - now[i] < 0){
        alert('Fecha pasada.');
        return;
      }
    }
    var daycheck = (now[0] == cfecha[0]) && (now[1] == cfecha[1]) && (now[2] == cfecha[2]);
    if(daycheck){
      alert('Same day.');
      return;
    }

    var repflag = false;
    this.af.database.list('Doctores/' + this.userID + '/Citas', {
      query: {
        orderByChild: 'fecha'
      }
    }).subscribe(res => {
      // console.log(res);
      if (!repflag) {
        repflag = true;
        var used = false;
        for (var i = 0; i < res.length; ++i) {
          if ((res[i].$key != this.cid) && (res[i].fecha == fecha) && (res[i].hora == hora)) {
            used = true;
          }
        }
        // console.log(used);
        if (!used) {
          var done = false;
          var hi = this.af.database.list('Pacientes', {
            query: {
              orderByChild: 'name',
              equalTo: this.cita.nombre,
              limitToFirst: 1
            }
          }).forEach(res => {
            // console.log(res);
            // console.log(res[0].$key);
            if (!done) {
              this.ds.af.auth.subscribe(
                (auth) => {
                  this.userID = auth.uid;
                  this.ds.updateCitaDoctor(this.userID, this.cid, this.cita.nombre, fecha, hora, diagnostico, receta, comentarios);
                });
              this.ds.updateCitaPaciente(res[0].$key, this.cid, this.cita.nombre, fecha, hora, diagnostico, receta, comentarios);
              done = true;
            }
          }).catch((error) => {
            alert('No se encontro el paciente.');
          });
        }
      }
    });

    // this.ds.af.auth.subscribe(
    //   (auth) => {
    //     this.userID = auth.uid;
    //     this.ds.updateCitaDoctor(this.userID, '-KysKLL0B71JJM3cH25Q', fecha, hora, diagnostico, receta, comentarios);
    //   });
    // this.ds.updateCitaPaciente('awcfG0poHDeera2GDKyozOuILvg1', '-KysKLL9pRC1D40D27vb', fecha, hora, diagnostico, receta, comentarios);
  }

  cancelar_cita(event) {
    event.preventDefault();
    var today = new Date();
    var now = [today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes()];
    var fechal = this.cita.fecha.split('/');
    var horal = this.cita.hora.split(':');
    var cfecha = [+fechal[2], +fechal[1], +fechal[0], +horal[0], +horal[1]];
    var daycheck = (now[0] == cfecha[0]) && (now[1] == cfecha[1]) && (now[2] == cfecha[2]);
    // var daycheck2 = (now[0] == cfecha[0]) && (now[1] > cfecha[1]);
    // var daycheck3 = (now[0] > cfecha[0]);
    // var daycheck = daycheck1 || daycheck2 || daycheck3;
    if(daycheck){
      alert('Same day.');
      return;
    }
    for(var i = 0; cfecha.length; ++i){
      if(cfecha[i] - now[i] > 0){
        break;
      }
      else if(cfecha[i] - now[i] < 0){
        alert('Fecha pasada.');
        return;
      }
    }

    var done = false;
    var hi = this.af.database.list('Pacientes', {
      query: {
        orderByChild: 'name',
        equalTo: this.cita.nombre,
        limitToFirst: 1
      }
    }).forEach(res => {
      // console.log(res);
      // console.log(res[0].$key);
      if (!done) {
        this.ds.af.auth.subscribe(
          (auth) => {
            this.userID = auth.uid;
            this.ds.cancelarCitaDoctor(this.userID, this.cid);
          });
        this.ds.cancelarCitaPaciente(res[0].$key, this.cid);
        done = true;
      }
    }).catch((error) => {
      alert('No se encontro el paciente.');
    });
    // this.ds.cancelarCitaDoctor(this.userID, this.cid);
  }

  // get_pacientes(){
  //         this.pacientes = this.af.database.list('Pacientes/',{
  //          query:{
  //            limitToLast:20,
  //            orderByKey: true
  //          }
  //        });
  //        console.log(this.pacientes);
  //        return this.pacientes;
  //     }

  set_current_cita(cita: ICita, cid: string) {
    // console.log(cita);
    this.cita = cita;
    this.cid = cid;
  }

  ngOnInit() {

  }

  ngAfterViewChecked() {

  }


}
