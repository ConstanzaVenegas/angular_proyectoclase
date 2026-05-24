import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-star',
  standalone: true,
  imports: [],
  templateUrl: './star.component.html',
  styleUrl: './star.component.css'
})
export class Star implements OnChanges {

  @Input() rating: number = 0;

  cropWidth: number = 0;

  ngOnChanges(): void {

    
    this.cropWidth = (this.rating / 5) * 100;

  }

}