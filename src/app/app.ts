import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected selectedDataPresetId = 'json-m';
  protected selectedRuns = 50;
  protected selectedBackendKey: string | null = null;
  protected lastDurationMs: number | null = null;
  protected averageDurationMs: number | null = null;
  protected benchmarkStatus = 'Idle';

  protected readonly dataPresets = [
    { id: 'json-s', label: 'JSON S', file: 'flat.json', sizeKb: 10 },
    { id: 'json-m', label: 'JSON M', file: 'flat.json', sizeKb: 100 },
    { id: 'json-l', label: 'JSON L', file: 'nested.json', sizeKb: 500 },
    { id: 'csv-m', label: 'CSV M', file: 'table.csv', sizeKb: 100 },
    { id: 'blob-l', label: 'Blob L', file: 'blob.txt', sizeKb: 1500 },
  ];

  protected readonly runPresets = [1, 50, 250, 1000];

  protected readonly backends = [
    { key: 'golang', label: 'Golang' },
    { key: 'spring', label: 'Spring Boot' },
    { key: 'dotnet', label: '.Net' },
    { key: 'django', label: 'Django' },
  ];

  protected selectDataPreset(presetId: string): void {
    this.selectedDataPresetId = presetId;
  }

  protected selectRuns(runs: number): void {
    this.selectedRuns = runs;
  }

  protected selectBackend(backendKey: string): void {
    this.selectedBackendKey = backendKey;
    this.benchmarkStatus = 'Ready';
  }

  protected get selectedDataPreset() {
    return this.dataPresets.find((preset) => preset.id === this.selectedDataPresetId);
  }

  protected get selectedBackendLabel(): string {
    return this.backends.find((backend) => backend.key === this.selectedBackendKey)?.label ?? '-';
  }

  protected get lastDurationDisplay(): string {
    return this.lastDurationMs === null ? '-' : `${this.lastDurationMs.toFixed(2)} ms`;
  }

  protected get averageDurationDisplay(): string {
    return this.averageDurationMs === null ? '-' : `${this.averageDurationMs.toFixed(2)} ms`;
  }
}
