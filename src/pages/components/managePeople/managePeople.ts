import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
import _ from "lodash";
import { List } from "../../../models/list";
import { DocumentReference } from "@firebase/firestore-types";
import { SiteStore } from "../../../services/siteStore";
import { User } from "../../../models/user";
import { FirestoreService } from "../../../services/firestoreService";

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

    isValid() {
        return this.addPersonModel.email && this.addPersonModel.email.length > 0;
    }

    constructor(public viewCtrl: ViewController, private params: NavParams, private store: SiteStore, private firestoreService: FirestoreService) {
        this.knownUserEmails = params.get("knownUserEmails") || [];
        this.list = params.get("list");
        
        this.fetchUserEmails(this.list.userIds).then((emails: string[]) => 
        {    
            if (!emails) return;

            console.log("users in list", emails);

            this.modifiedList = _.uniq(this.modifiedList.concat([...emails]));
            this.existingEmails = [...emails];
            this.isLoading = false;
        });        
    }

    private fetchUserEmails(userRefs: DocumentReference[]): Promise<string[]> {
        return Promise.all(userRefs.map(userRef => userRef.get().then(documentSnapshot => {
            const userData = documentSnapshot.data();
            return userData.email;
        })));
    }

    private addEmail() {
        if (this.isValid()) {
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

    private hasChanged() {
        return this.modifiedList.length > 0;
    }

    private removeEmailsFromList(): Promise<void> {
        const emailsToRemove =  _.difference(this.existingEmails, this.modifiedList);

        if (_.some(emailsToRemove))
            return this.firestoreService.removeListForUsers(this.list, emailsToRemove).then(() => console.log("done removing", emailsToRemove));
        
        return Promise.resolve();
    }

    private addEmailsToList(): Promise<void> {
        const emailsToAdd = _.difference(this.modifiedList, this.existingEmails);

        if (_.some(emailsToAdd))
            return this.firestoreService.addUsersToList(this.list, this.store.getUser(), emailsToAdd).then(() => console.log("done adding", emailsToAdd));
        
        return Promise.resolve();
    }

    save() {        
        const savingListPromise = Promise.all([this.addEmailsToList(), this.removeEmailsFromList()]).then( () => console.log("adding and removing done"));
        
        this.viewCtrl.dismiss({savingListPromise});
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}