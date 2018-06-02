import { Injectable } from '@angular/core';
import { User } from 'models/user';

@Injectable()
export class SiteStore {

	private user: User;

	constructor() {
	}

	setUser(user: User) {
		this.user = user;
	}

	getUser(): User {
		return this.user;
	}

	clearUser() {
		this.user = null;
	}
}
