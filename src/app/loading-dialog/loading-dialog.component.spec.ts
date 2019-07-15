import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingDialogPage } from './loading-dialog.page';

describe('LoadingDialogPage', () => {
  let component: LoadingDialogPage;
  let fixture: ComponentFixture<LoadingDialogPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingDialogPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
