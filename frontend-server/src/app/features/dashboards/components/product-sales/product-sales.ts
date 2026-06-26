import { Component, signal, inject, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ProductSalesAnalyticsService } from '../../services/product-sales-analytics';

@Component({
  selector: 'app-product-sales',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './product-sales.html',
  styleUrl: './product-sales.css'
})
export class ProductSalesComponent implements OnInit {

  private analyticsService = inject(ProductSalesAnalyticsService);

  salesData = signal(this.analyticsService.getSalesData());
  topRankingData = signal<any[]>([]);

  ngOnInit() {
    const token = localStorage.getItem('token') ?? '';
    this.analyticsService.getTopProductsByRating(token).subscribe(data => {
      this.topRankingData.set(data.map((p: any) => ({
        name: p.nombre_producto,
       value: Number(p.starRating)
      })));
    });
  }
}