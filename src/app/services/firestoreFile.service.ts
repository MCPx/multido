import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { HTTP } from '@ionic-native/http/ngx';

@Injectable({
    providedIn: 'root'
})
export class FirestoreFileService {

    constructor(private storage: AngularFireStorage, private http: HTTP) {

    }

    getImageUrl(id: string): Promise<string> {
        return this.storage.ref(id).getDownloadURL().toPromise();
    }

    async getImageById(id: string) {
        const url = await this.getImageUrl(id);
        const response = await this.http.get(url, {}, {});
        return response.data;
    }

    async uploadImage(imageId: string, base64Data: string) {
        return this.storage.ref(imageId).putString(base64Data);
    }
}
