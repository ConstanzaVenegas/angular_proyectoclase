import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-number',
  standalone: true,
  imports: [ScrollingModule],
  templateUrl: './number.html',
  styleUrls: ['./number.css']
})
export class NumberComponent {
  numbers = new Array(1000).fill(0);
}