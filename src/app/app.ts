import { Component } from '@angular/core';

type BackendKey = 'golang' | 'spring' | 'dotnet' | 'django';

type BenchmarkResponse = {
  type: string;
  sizeKb: number;
  runs: number;
  durations: number[];
  average_ms: number;
  median_ms: number;
  data_bytes: number;
  generated: boolean;
  server_time: string;
  warnings?: string[];
  error?: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected selectedDataPresetId = 'json-m';
  protected selectedRuns = 50;
  protected selectedBackendKey: string | null = null;
  protected lastDurationMs: number | null = null;
  protected averageDurationMs: number | null = null;
  protected medianDurationMs: number | null = null;
  protected benchmarkStatus = 'Idle';
  protected benchmarkError: string | null = null;
  protected benchmarkWarnings: string[] = [];
  protected isRunningBenchmark = false;

  private readonly backendEndpoints: Record<BackendKey, string> = {
    golang: '/api/golang/benchmark',
    spring: '/api/spring/benchmark',
    dotnet: '/api/dotnet/benchmark',
    django: '/api/django/benchmark',
  };

  protected readonly dataPresets = [
    { id: 'json-s', label: 'JSON S', file: 'flat.json', sizeKb: 10, type: 'flat-json' },
    { id: 'json-m', label: 'JSON M', file: 'flat.json', sizeKb: 100, type: 'flat-json' },
    { id: 'json-l', label: 'JSON L', file: 'nested.json', sizeKb: 500, type: 'nested-json' },
    { id: 'csv-m', label: 'CSV M', file: 'table.csv', sizeKb: 100, type: 'csv' },
    { id: 'blob-l', label: 'Blob L', file: 'blob.txt', sizeKb: 1500, type: 'blob' },
  ];

  protected readonly runPresets = [1, 50, 250, 1000];

  protected readonly backends: Array<{ key: BackendKey; label: string }> = [
    { key: 'golang', label: 'Golang' },
    { key: 'spring', label: 'Spring Boot' },
    { key: 'dotnet', label: '.Net' },
    { key: 'django', label: 'Django' },
  ];

  protected selectDataPreset(presetId: string): void {
    if (this.isRunningBenchmark) {
      return;
    }

    this.selectedDataPresetId = presetId;
  }

  protected selectRuns(runs: number): void {
    if (this.isRunningBenchmark) {
      return;
    }

    this.selectedRuns = runs;
  }

  protected selectBackend(backendKey: string): void {
    this.selectedBackendKey = backendKey;
    this.benchmarkStatus = 'Ready';
  }

  protected async runBackendRequest(backendKey: BackendKey): Promise<void> {
    if (this.isRunningBenchmark) {
      return;
    }

    const selectedPreset = this.selectedDataPreset;

    if (!selectedPreset) {
      this.benchmarkStatus = 'No preset selected';
      return;
    }

    this.selectBackend(backendKey);
    this.isRunningBenchmark = true;
    this.benchmarkError = null;
    this.benchmarkWarnings = [];
    this.benchmarkStatus = `Running ${backendKey} benchmark...`;

    const endpoint = this.backendEndpoints[backendKey];
    const query = new URLSearchParams({
      size: String(selectedPreset.sizeKb),
      type: selectedPreset.type,
      runs: String(this.selectedRuns),
    });
    const url = `${endpoint}?${query.toString()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const result = (await response.json()) as BenchmarkResponse;

      if (!response.ok) {
        throw new Error(result.error ?? `HTTP ${response.status}`);
      }

      this.lastDurationMs = result.durations.at(-1) ?? null;
      this.averageDurationMs = result.average_ms;
      this.medianDurationMs = result.median_ms;
      this.benchmarkWarnings = result.warnings ?? [];
      this.benchmarkStatus = `Completed ${result.runs} run(s)`;
    } catch (error) {
      this.lastDurationMs = null;
      this.averageDurationMs = null;
      this.medianDurationMs = null;
      this.benchmarkWarnings = [];
      this.benchmarkError = error instanceof Error ? error.message : 'Unknown request error';
      this.benchmarkStatus = 'Request failed';
    } finally {
      this.isRunningBenchmark = false;
    }
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

  protected get medianDurationDisplay(): string {
    return this.medianDurationMs === null ? '-' : `${this.medianDurationMs.toFixed(2)} ms`;
  }
}
