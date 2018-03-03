import { Injectable } from '@angular/core';
 
@Injectable()
export class SiteStore {

	private username: string;

	constructor() {
	}

	setUserName(username: string) {
		console.log(`Setting username to: ${username}`);
		this.username = username;
	}
	
    getUserName() {
        return this.username;
    }
}