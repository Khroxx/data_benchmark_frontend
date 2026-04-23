import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected sizeKb = 100;

  protected readonly backends = [
    { key: 'golang', label: 'Golang' },
    { key: 'spring', label: 'Spring Boot' },
    { key: 'dotnet', label: '.Net' },
    { key: 'django', label: 'Django' },
  ];

  protected onSizeKbInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    if (Number.isNaN(value)) {
      this.sizeKb = 100;
      return;
    }

    this.sizeKb = Math.min(50000, Math.max(1, Math.trunc(value)));
  }
}
