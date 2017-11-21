import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FirebaseListObservable, AngularFire } from "angularfire2";
import { Router } from "@angular/router";
import { ICita, IUsuario, IPaciente } from '../interfaces/data_structure';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthMethods } from 'angularfire2';
import { DataService } from '../interfaces/data.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css'],

})
export class PacienteComponent implements OnInit {
  public userID: String;
  public error: any;
  citas: FirebaseListObservable<any[]>;
  public cita: ICita;
  public cid: string;

  constructor(private router: Router,
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

  get_citas() {

    this.ds.af.auth.subscribe(
      (auth) => {
        if(auth == null){
          window.location.reload();
          return;
        }
        this.userID = auth.uid;
        this.citas = this.af.database.list('Pacientes/' + this.userID + '/Citas', {
          query: {
            limitToLast: 20,
            orderByKey: true
          }
        });
        return this.citas;
      });
  }

  actualizar_cita(event, fecha: string, hora: string) {
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
    for (var i = 0; cfecha.length; ++i) {
      if (cfecha[i] - now[i] > 0) {
        break;
      }
      else if (cfecha[i] - now[i] < 0) {
        alert('Fecha pasada.');
        return;
      }
    }
    var daycheck = (now[0] == cfecha[0]) && (now[1] == cfecha[1]) && (now[2] == cfecha[2]);
    if (daycheck) {
      alert('Es hoy mismo.');
      return;
    }

    var repflag = false;
    this.af.database.list('Pacientes/' + this.userID + '/Citas', {
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
          var hi = this.af.database.list('Doctores', {
            query: {
              // orderByChild: 'name',
              // equalTo: this.cita.nombre,
              // limitToFirst: 1
            }
          }).forEach(res => {
            // console.log(res);
            // console.log(res[0].$key);
            if (!done) {
              done = true;
              var doc = -1;
              for (var i = 0; i < res.length; ++i) {
                if ('Citas' in res[i] && this.cid in res[i].Citas) {
                  // console.log(res[i].$key);
                  doc = i;
                  break;
                }
              }
              if (doc == -1) {
                return;
              }
              this.ds.af.auth.subscribe(
                (auth) => {
                  this.userID = auth.uid;
                  this.ds.updateCitaPaciente(this.userID, this.cid, this.cita.nombre, fecha, hora, this.cita.diagnostico, this.cita.receta, this.cita.comentarios);
                  // this.ds.updateCitaDoctor(this.userID, this.cid, this.cita.nombre, fecha, hora, this.cita.diagnostico, this.cita.receta, this.cita.comentarios);
                });
              this.ds.updateCitaDoctor(res[doc].$key, this.cid, this.cita.nombre, fecha, hora, this.cita.diagnostico, this.cita.receta, this.cita.comentarios);
              // this.ds.updateCitaPaciente(res[0].$key, this.cid, fecha, hora, this.cita.diagnostico, this.cita.receta, this.cita.comentarios);
            }
          }).catch((error) => {
            // console.log(error);
            alert('No se encontro el doctor.');
          });
        }
        else if(used){
          alert('Fecha ocupada');
        }
      }
    });
  }

  cancelar_cita(event) {
    event.preventDefault();
    var today = new Date();
    var now = [today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes()];
    var fechal = this.cita.fecha.split('/');
    var horal = this.cita.hora.split(':');
    var cfecha = [+fechal[2], +fechal[1], +fechal[0], +horal[0], +horal[1]];
    var daycheck = (now[0] == cfecha[0]) && (now[1] == cfecha[1]) && (now[2] == cfecha[2]);
    if (daycheck) {
      alert('Same day.');
      return;
    }
    for (var i = 0; cfecha.length; ++i) {
      if (cfecha[i] - now[i] > 0) {
        break;
      }
      else if (cfecha[i] - now[i] < 0) {
        alert('Fecha pasada.');
        return;
      }
    }

    var done = false;
    var hi = this.af.database.list('Doctores', {
      query: {
        orderByChild: 'email',
        // equalTo: this.cita.nombre,
        // limitToFirst: 1
      }
    }).forEach(res => {
      if (!done) {
        done = true;
        var doc = -1;
        for (var i = 0; i < res.length; ++i) {
          if ('Citas' in res[i] && this.cid in res[i].Citas) {
            // console.log(res[i].$key);
            doc = i;
            break;
          }
        }
        if (doc == -1) {
          return;
        }
        this.ds.af.auth.subscribe(
          (auth) => {
            this.userID = auth.uid;
            this.ds.cancelarCitaPaciente(this.userID, this.cid);
          });

        this.ds.cancelarCitaDoctor(res[doc].$key, this.cid);
      }
    }).catch((error) => {
      alert('No se encontro el doctor.');
    });
  }

  set_current_cita(cita: ICita, cid: string) {
    // console.log(cita);
    this.cita = cita;
    this.cid = cid;
  }

  ngOnInit() {
  }

}
