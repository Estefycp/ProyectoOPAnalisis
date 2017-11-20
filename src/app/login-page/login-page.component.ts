import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {DataService} from '../interfaces/data.service';
import * as firebase from 'firebase';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  public error: any;
  public userID: String;
  public i: FirebaseObjectObservable<any>;
  public key: any;
  constructor(
              private router: Router,
              public af: AngularFire,
              private ds: DataService) {}



  loginWithEmail(event, email, password){
    event.preventDefault();
    this.ds.loginWithEmail(email, password).then(() => {
      this.ds.af.auth.subscribe(
        (auth) =>{
          this.userID = auth.uid;
          this.i = this.af.database.object('Usuarios/'+this.userID+'/type', { preserveSnapshot: true });
          this.i.subscribe(snapshot => {
            this.router.navigate([snapshot.val()]);
          });
        });

    })
      .catch((error: any) => {
        if (error) {
          this.error = error;
          console.log(this.error);
        }
      });
  }
}
