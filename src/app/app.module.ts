import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { LoginPageComponent } from './login-page/login-page.component';
import {RouterModule, Routes} from "@angular/router";
import { HomePageComponent } from './home-page/home-page.component';
import {FormsModule} from "@angular/forms";
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { PacienteComponent } from './paciente/paciente.component';
import { SecretariaComponent } from './secretaria/secretaria.component';
import {DataService} from './interfaces/data.service';



export const firebaseConfig = {
    // apiKey: "AIzaSyDosWLCRwu2X9MJx5d3t--2d_Ygyp0rIWk",
    // authDomain: "pagina-e79fe.firebaseapp.com",
    // databaseURL: "https://pagina-e79fe.firebaseio.com",
    // projectId: "pagina-e79fe",
    // storageBucket: "pagina-e79fe.appspot.com",
    // messagingSenderId: "262086105509",

    apiKey: "AIzaSyBNFDf3xrGmC7AbDB8gaEavxWtjo3THvZo",
    authDomain: "citas-12fd1.firebaseapp.com",
    databaseURL: "https://citas-12fd1.firebaseio.com",
    projectId: "citas-12fd1",
    storageBucket: "citas-12fd1.appspot.com",
    messagingSenderId: "689432831653"
};

const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'paciente', component: PacienteComponent },
  { path: 'secretaria', component: SecretariaComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegistrationPageComponent}
];

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(routes),
    FormsModule
  ],
  declarations: [ AppComponent, LoginPageComponent, HomePageComponent, RegistrationPageComponent, PacienteComponent, SecretariaComponent ],
  bootstrap: [ AppComponent ],
  providers: [DataService]
})
export class AppModule {}
