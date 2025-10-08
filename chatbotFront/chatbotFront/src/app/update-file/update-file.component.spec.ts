import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFileComponent } from './update-file.component';

describe('UpdateFileComponent', () => {
  let component: UpdateFileComponent;
  let fixture: ComponentFixture<UpdateFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateFileComponent]
    });
    fixture = TestBed.createComponent(UpdateFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
