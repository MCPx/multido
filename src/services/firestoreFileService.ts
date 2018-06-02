import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { AngularFireStorage } from 'angularfire2/storage';
import { uuid } from 'util/utility'

@Injectable()
export class FirestoreFileService {

    constructor(private storage: AngularFireStorage) {
        
    }

    getImageUrl(id: string): Promise<string> {
        return this.storage.ref(id).getDownloadURL().toPromise();
    }
    
    uploadImage(imageId: string, fileData: ArrayBuffer) {
        return this.storage.upload(imageId, fileData);
    }
}