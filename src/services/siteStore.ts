import { Injectable } from '@angular/core';
import { User } from '../models/user';
 
@Injectable()
export class SiteStore {

	private user: User;

	constructor() {
	}

	setUser(user: User) {
		console.log('Setting user to: ', user);
		this.user = user;
	}
	
    getUser() : User{
        return this.user;
    }
}