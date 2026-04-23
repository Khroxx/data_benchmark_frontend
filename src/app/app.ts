import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly backends = [
    { key: 'golang', label: 'Golang' },
    { key: 'spring', label: 'Spring Boot' },
    { key: 'dotnet', label: '.Net' },
    { key: 'django', label: 'Django' },
  ];
}
