import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Number } from './number';

describe('Number', () => {
  let component: Number;
  let fixture: ComponentFixture<Number>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Number],
    }).compileComponents();

    fixture = TestBed.createComponent(Number);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
