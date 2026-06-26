import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSales } from './product-sales';

describe('ProductSales', () => {
  let component: ProductSales;
  let fixture: ComponentFixture<ProductSales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductSales],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSales);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
