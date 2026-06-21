import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPagination } from './product-pagination';

describe('ProductPagination', () => {
  let component: ProductPagination;
  let fixture: ComponentFixture<ProductPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPagination);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
