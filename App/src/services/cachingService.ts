import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';

@Injectable()
export class CachingService {
    constructor(private storage: Storage) {

    }

    async tryGetOrAdd(key: string, getValue: () => Promise<any>): Promise<any> {
        let value = await this.storage.get(key);
        
        if (value !== null && value !== undefined)
            return Promise.resolve(value);

        value = await getValue();
        this.storage.set(key, value);

        return value;
    }

    async add(key: string, data: any): Promise<void> {
        return this.storage.set(key, data);
    }

    async clear(key: string): Promise<void> {
        return this.storage.remove(key);
    }
}