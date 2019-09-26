import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThanosHandComponent } from './thanos-hand.component';

describe('ThanosHandComponent', () => {
  let component: ThanosHandComponent;
  let fixture: ComponentFixture<ThanosHandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThanosHandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThanosHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
