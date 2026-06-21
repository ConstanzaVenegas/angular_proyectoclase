import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { faker } from '@faker-js/faker';

interface UserData {
  name: string;
  email: string;
  avatar: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ScrollingModule],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class UserComponent {
  data: UserData[] = new Array(10000).fill(1).map(() => ({
    name:   faker.person.fullName(),
    email:  faker.internet.email(),
    avatar: faker.image.avatar()
  }));
}