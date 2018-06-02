import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';

@Injectable()
export class CachingService {
    constructor(private storage: Storage) {

    }

    tryGetOrAdd(key: string, getValue: () => Promise<string>): Promise<string> {
        return this.storage.get(key).then(result => {
            console.log("Result ", result)
            if (result !== null && result !== undefined) return Promise.resolve(result);

            return getValue().then(value => { 
                this.storage.set(key, value);
                return value;
            });
        });
        
        

        
    }
}