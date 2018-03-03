import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

interface User {
  id: string;
  name: string;
}

@Component({selector: 'page-home', templateUrl: 'home.html'})
export class HomePage {

  users: User[] = [];

  constructor(public navCtrl: NavController, public afs:AngularFirestore) {
    
    let collection = this.afs.collection('users');
    
    collection.ref.get().then(querySnapshot => {
      querySnapshot.forEach(queryDocumentSnapshot => {
        this.users.push({id: queryDocumentSnapshot.id, name: queryDocumentSnapshot.data().name});
      });
    });
  }

  ionViewWillEnter() {
  }

}
