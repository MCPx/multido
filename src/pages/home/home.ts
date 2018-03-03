import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public afs:AngularFirestore) {
    let collection = this.afs.collection('users');
    
    collection.doc("avIyq6la855aKTuikuvm").ref.get().then((documentSnapshot) => 
    { 
      console.log("users", documentSnapshot.data());
    }); //ref()
  }

  ionViewWillEnter() {
  }

}
