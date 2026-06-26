import { TestBed } from '@angular/core/testing';

import { ProductSalesAnalytics } from './product-sales-analytics';

describe('ProductSalesAnalytics', () => {
  let service: ProductSalesAnalytics;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSalesAnalytics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
