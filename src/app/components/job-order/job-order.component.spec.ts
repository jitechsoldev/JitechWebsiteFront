import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOrderComponent } from './job-order.component';

describe('JobOrderComponent', () => {
  let component: JobOrderComponent;
  let fixture: ComponentFixture<JobOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
