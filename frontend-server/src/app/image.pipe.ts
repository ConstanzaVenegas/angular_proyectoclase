import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'image',
  standalone: true
})
export class ImagePipe implements PipeTransform {

  
  transform(value: string | undefined): string {
   
    return value ? value : 'assets/no-image.png';
  }

}