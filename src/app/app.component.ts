import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {DataService} from './interfaces/data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isLoggedIn: boolean;
  public userID: String;
  public i: FirebaseObjectObservable<any>;

  constructor(public afService: DataService, private router: Router, public af: AngularFire) {
    this.afService.af.auth.subscribe(
      (auth) => {
        if(auth == null) {
          console.log("Not Logged in.");
          this.isLoggedIn = false;
          this.router.navigate(['login']);
        }
        else {
          console.log("Successfully Logged in.");
          this.userID = auth.uid;
          this.i = this.af.database.object('Usuarios/'+this.userID+'/type', { preserveSnapshot: true });
          this.afService.displayName = auth.auth.email;
          this.afService.email = auth.auth.email;
          this.isLoggedIn = true;
          this.i.subscribe(snapshot => {
            this.router.navigate([snapshot.val()]);
          });
        }
      }
    );
  }

  logout() {
    this.afService.logout();
  }
}
