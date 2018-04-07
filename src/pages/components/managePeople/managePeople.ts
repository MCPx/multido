import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
import _ from "lodash";
import { List } from "../../../models/list";
import { DocumentReference } from "@firebase/firestore-types";
import { SiteStore } from "../../../services/siteStore";
import { User } from "../../../models/user";

interface AddPersonModel{
    email : string;
}

@Component({selector: 'page-managepeople', templateUrl: 'managePeople.html'})
export class ManagePeoplePage
{
    addPersonModel : AddPersonModel = { email: undefined };
    knownUserEmails: string[];    
    existingEmails: string[] = [];    
    modifiedList: string[] = [];
    searchResults: string[] = [];
    isLoading: boolean = true;
    list: List; 
    usersOnList: User[]; 

    isValid() {
        return this.addPersonModel.email && this.addPersonModel.email.length > 0;
    }

    constructor(public viewCtrl: ViewController, private params: NavParams, private store: SiteStore) {
        this.knownUserEmails = params.get("knownUserEmails") || [];
        this.list = params.get("list");
        
        this.fetchUserEmails(this.list.userIds).then((users: User[]) => 
        {    
            const emails = users.map(user => user.email);
            this.usersOnList = users;
            this.modifiedList = _.uniq(this.modifiedList.concat([...emails]));
            this.existingEmails = [...emails];
            this.isLoading = false;
        });        
    }

    private fetchUserEmails(userRefs: DocumentReference[]) {
        return Promise.all(userRefs.map(userRef => userRef.get().then(documentSnapshot => {
            const userData = documentSnapshot.data();
            return <User>{ id: documentSnapshot.id, userRef, name: userData.name, listIds: userData.listIds || [], knownUserEmails: userData.knownUserEmails || [], email: userData.email }
        })));
    }

    private addEmail() {
        if (this.isValid())
        {
            this.modifiedList.push(this.addPersonModel.email.toLowerCase());
            this.clearForm();
        }
    }

    private search(value: string) {
        if (!value) {
            this.searchResults = [];
            return;
        }
        
        this.searchResults = this.knownUserEmails
                                .filter(email => email.indexOf(value.toLowerCase()) >= 0) // include known 
                                .filter(email => this.modifiedList.indexOf(email) < 0); // exclude if already in modified list
    }

    private clearForm()
    {
        this.addPersonModel.email = "";        
        this.searchResults = [];
    }

    private handleMatchingEmailClick(email: string) {         
        this.clearForm();

        if (this.modifiedList.indexOf(email) >= 0) return;

        this.modifiedList.push(email);
    }

    private handleRemoveUserClick(emailToRemove: string) {
        this.modifiedList = this.modifiedList.filter(email => email !== emailToRemove)
    }

    save() {
        // TODO
        const data = {
            
        };
        this.viewCtrl.dismiss(data);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}