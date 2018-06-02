import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { AngularFireStorage } from 'angularfire2/storage';
import { uuid } from 'util/utility';
import { HTTP } from '@ionic-native/http';

@Injectable()
export class FirestoreFileService {

    constructor(private storage: AngularFireStorage, private http: HTTP) {
        
    }

    getImageUrl(id: string): Promise<string> {
        return this.storage.ref(id).getDownloadURL().toPromise();
    }

    getImageById(id: string) {
        return this.getImageUrl(id)
            .then(url => this.http.get(url, {}, {}))
            .then(response => response.data);
    }
    
    uploadImage(imageId: string, base64Data: string) {
        return this.storage.ref(imageId).putString(base64Data);
    }
}