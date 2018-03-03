import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

interface LoginModel {
    username: string;
}

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class Login {
    constructor(private nav: NavController){

    }

    loginModel: LoginModel = { username: null};

    public login()
    {
        if (!this.loginModel.username) return;

        console.log("Logging in", this.loginModel.username);
    }

}