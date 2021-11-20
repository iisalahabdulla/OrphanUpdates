import { ComponentFixture, TestBed } from '@angular/core/testing';

import { employeeManagingComponent } from './employee-managing.component';

describe('employeeManagingComponent', () => {
  let component: employeeManagingComponent;
  let fixture: ComponentFixture<employeeManagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [employeeManagingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(employeeManagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
