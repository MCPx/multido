import { TestBed } from '@angular/core/testing';

import { CachingService } from './caching.service';

describe('CachingService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: CachingService = TestBed.get(CachingService);
        expect(service).toBeTruthy();
    });
});
