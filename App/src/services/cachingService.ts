import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';

@Injectable()
export class CachingService {
    constructor(private localStorage: Storage) {

    }

    async tryGetOrAdd(key: string, getValue: () => Promise<any>): Promise<any> {
        let value = await this.localStorage.get(key);
        
        if (value !== null && value !== undefined)
            return Promise.resolve(value);

        value = await getValue();
        this.localStorage.set(key, value);

        return value;
    }

    async add(key: string, data: any): Promise<void> {
        return this.localStorage.set(key, data);
    }

    async clear(key: string): Promise<void> {
        return this.localStorage.remove(key);
    }
}