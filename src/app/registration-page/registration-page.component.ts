import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {DataService} from '../interfaces/data.service';
import {ICita, Cita, IUsuario, Usuario,IDoctor,Doctor,ISecretaria,Secretaria,
        IPaciente,Paciente} from '../interfaces/data_structure';

@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.css']
})
export class RegistrationPageComponent {
  public error: any;
  public type: string;

  constructor(private router: Router, private ds: DataService) {}

  register(event, name, email, password,utype) {
    event.preventDefault();

    if(utype=='home'){
    this.ds.registerUser(email, password).then((user) => {
      this.ds.createUser(user.uid, name, email,utype);
      this.ds.createDoctor(user.uid, name, email,utype).then(() => {
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

    if(utype=='secretaria'){
    this.ds.registerUser(email, password).then((user) => {
      this.ds.createUser(user.uid, name, email,utype);
      this.ds.createSecretaria(user.uid, name, email,utype).then(() => {
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

    if(utype=='paciente'){
    this.ds.registerUser(email, password).then((user) => {
      this.ds.createUser(user.uid, name, email,utype);
      this.ds.createPaciente(user.uid, name, email,utype).then(() => {
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
  }
}
