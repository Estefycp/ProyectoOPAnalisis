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
  public hcitas: Map<string, FirebaseListObservable<any[]>>;
  public dids: string[];
  doctores: FirebaseListObservable<any[]>;
  pacientes: FirebaseListObservable<any[]>;
  public curdid: string;
  public cita: ICita;
  public cid: string;

  constructor(private router: Router,
    private afd: AngularFireDatabase,
    public af: AngularFire,
    private ds: DataService) {
    this.hcitas = new Map<string, FirebaseListObservable<any[]>>();
    this.hcitas['hola'] = null;
    this.dids = [];
    this.get_doctores();
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
    this.curdid = '';
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
        // window.location.reload();
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

  crear_cita(event, nombre: string, fecha: string, hora: string, diagnostico: string, receta: string, comentarios: string) {
    event.preventDefault();
    // console.log(this.curdid);
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
    for (var i = 0; cfecha.length; ++i) {
      if (cfecha[i] - now[i] > 0) {
        break;
      }
      else if (cfecha[i] - now[i] < 0) {
        alert('Fecha pasada.');
        return;
      }
    }

    var repflag = false;
    this.af.database.list('Doctores/' + this.curdid + '/Citas', {
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
              orderByChild: 'email',
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
                    this.ds.updateCitaDoctor(this.curdid, res.key, nombre, fecha, hora, diagnostico, receta, comentarios);
                  });
              });
              done = true;
            }
          }).catch((error) => {
            alert('No se encontro el paciente.');
          });
        }
        else if (used) {
          alert('Fecha ocupada');
        }
      }
    });
  }


  get_citas() {
    var done1 = false;
    this.ds.af.auth.subscribe(
      (auth) => {
        if (done1) return;
        done1 = true;
        this.userID = auth.uid;
        this.citas = this.af.database.list('Secretarias/' + this.userID + '/Doctores/-KytQkr0VjhwkN-BqNik/Citas', {
          query: {
            limitToLast: 20,
            orderByKey: true
          }
        });
        var done = false;
        this.af.database.list('Secretarias/' + this.userID + '/Doctores', {
          query: {
            orderByKey: true
          }
        }).forEach(res => {
          if (!done) {
            // console.log(res);
            done = true;
            for (var i = 0; i < res.length; ++i) {
              // console.log(res[i].uid);
              this.dids.push(res[i].uid);
              // alert('Doctores/' + this.dids[i] + '/Citas');
              this.hcitas[res[i].uid] = this.af.database.list('Doctores/' + this.dids[i] + '/Citas', {
                query: {
                  orderByChild: 'fecha',
                }
              });
            }
          }
        }).catch((error) => {
          console.log('No se encontraron doctores.');
        });
        return this.citas;
      });

  }

  getd_citas(did: string): FirebaseListObservable<any[]> {
    if (this.hcitas != null) {
      return this.hcitas[did];
    }
    // alert('null');
    return this.hcitas[did] = this.af.database.list('Doctores/' + did + '/Citas', {
      query: {
        orderByChild: 'fecha',
      }
    });
  }

  get_doctores() {
    this.ds.af.auth.subscribe(
      (auth) => {
        if (auth == null) {
          window.location.reload();
          return;
        }
        this.userID = auth.uid;
        this.doctores = this.af.database.list('Secretarias/' + this.userID + '/Doctores', {
          query: {
            limitToLast: 20,
            orderByKey: true
          }
        });
        return this.doctores;
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
      alert('Same day.');
      return;
    }

    var repflag = false;
    this.af.database.list('Doctores/' + this.curdid + '/Citas', {
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
              orderByChild: 'email',
              equalTo: this.cita.nombre,
              limitToFirst: 1
            }
          }).forEach(res => {
            // console.log(res);
            // console.log(res[0].$key);
            if (!done) {
              done = true;
              this.ds.updateCitaDoctor(this.curdid, this.cid, this.cita.nombre, fecha, hora, this.cita.diagnostico, this.cita.receta, this.cita.comentarios);
              this.ds.updateCitaPaciente(res[0].$key, this.cid, this.cita.nombre, fecha, hora, this.cita.diagnostico, this.cita.receta, this.cita.comentarios);
            }
          }).catch((error) => {
            alert('No se encontro el paciente.');
          });
        }
        else if (used) {
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
    // var daycheck2 = (now[0] == cfecha[0]) && (now[1] > cfecha[1]);
    // var daycheck3 = (now[0] > cfecha[0]);
    // var daycheck = daycheck1 || daycheck2 || daycheck3;
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
    var hi = this.af.database.list('Pacientes', {
      query: {
        orderByChild: 'email',
        equalTo: this.cita.nombre,
        limitToFirst: 1
      }
    }).forEach(res => {
      // console.log(res);
      // console.log(res[0].$key);
      if (!done) {
        this.ds.cancelarCitaDoctor(this.curdid, this.cid);
        this.ds.cancelarCitaPaciente(res[0].$key, this.cid);
        done = true;
      }
    }).catch((error) => {
      alert('No se encontro el paciente.');
    });
    // this.ds.cancelarCitaDoctor(this.userID, this.cid);
  }

  set_current_cita(curdid, cita: ICita, cid: string) {
    // console.log(cita);
    this.curdid = curdid;
    this.cita = cita;
    this.cid = cid;
  }

  set_current_doctor(curdid) {
    this.curdid = curdid;
  }

  ngOnInit() { }

  ngAfterViewChecked() {

  }

}
