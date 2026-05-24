import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-star',
  standalone: true,
  templateUrl: './star.component.html',
  styleUrl: './star.component.css'
})
export class StarComponent {
  // PPT 5.6a: Definimos el rating como un Input de tipo Signal
  rating = input<number>(0);

  // PPT 5.6b: Calculamos el ancho de las estrellas automáticamente (75px = 5 estrellas)
  starWidth = computed(() => this.rating() * 75 / 5);
}