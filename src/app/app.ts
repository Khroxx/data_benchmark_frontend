import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { environment } from '../environments/environment';

type BackendKey = 'golang' | 'spring' | 'dotnet' | 'django';

type BenchmarkResponse = {
  type: string;
  sizeKb: number;
  runs: number;
  durations: number[];
  average_ms: number;
  median_ms: number;
  data_bytes: number;
  processed_bytes?: number;
  warmup_ms?: number;
  generated: boolean;
  server_time: string;
  warnings?: string[];
  error?: string;
};

type BackendBenchmarkState = {
  key: BackendKey;
  label: string;
  lastDurationMs: number | null;
  averageDurationMs: number | null;
  medianDurationMs: number | null;
  status: string;
  error: string | null;
  warnings: string[];
  dataBytes: number | null;
  processedBytes: number | null;
  runs: number | null;
};

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected selectedDataPresetId = 'json-m';
  protected selectedRuns = 50;
  protected selectedBackendKey: BackendKey | null = null;
  protected benchmarkStatus = 'Idle';
  protected isRunningBenchmark = false;

  private readonly backendEndpoints: Record<BackendKey, string> = {
    golang: this.buildEndpoint('/api/golang/benchmark'),
    spring: this.buildEndpoint('/api/spring/benchmark'),
    dotnet: this.buildEndpoint('/api/dotnet/benchmark'),
    django: this.buildEndpoint('/api/django/benchmark'),
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

  protected readonly benchmarkStates: Record<BackendKey, BackendBenchmarkState> = {
    golang: this.createBenchmarkState('golang', 'Golang'),
    spring: this.createBenchmarkState('spring', 'Spring Boot'),
    dotnet: this.createBenchmarkState('dotnet', '.Net'),
    django: this.createBenchmarkState('django', 'Django'),
  };

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

  protected async runBackendRequest(backendKey: BackendKey): Promise<void> {
    if (this.isRunningBenchmark) {
      return;
    }

    const selectedPreset = this.selectedDataPreset;
    if (!selectedPreset) {
      this.benchmarkStatus = 'No preset selected';
      return;
    }

    const benchmarkState = this.benchmarkStates[backendKey];
    this.selectedBackendKey = backendKey;
    this.isRunningBenchmark = true;
    this.benchmarkStatus = `Running ${benchmarkState.label} benchmark...`;
    benchmarkState.status = 'Running...';
    benchmarkState.error = null;
    benchmarkState.warnings = [];
    this.changeDetectorRef.detectChanges();

    const endpoint = this.backendEndpoints[backendKey];
    const query = new URLSearchParams({
      size: String(selectedPreset.sizeKb),
      type: selectedPreset.type,
      runs: String(this.selectedRuns),
    });
    const url = `${endpoint}?${query.toString()}`;
    const requestStartedAt = performance.now();

    try {
      const response = await fetch(url, { method: 'GET' });
      const result = (await response.json()) as BenchmarkResponse;

      if (!response.ok) {
        throw new Error(result.error ?? `HTTP ${response.status}`);
      }

      const roundTripDurationMs = performance.now() - requestStartedAt;
      const fallbackAverageMs = roundTripDurationMs / Math.max(result.runs, 1);
      const serverLastDurationMs = result.durations.at(-1) ?? null;

      benchmarkState.lastDurationMs =
        serverLastDurationMs !== null && serverLastDurationMs > 0 ? serverLastDurationMs : roundTripDurationMs;
      benchmarkState.averageDurationMs = result.average_ms > 0 ? result.average_ms : fallbackAverageMs;
      benchmarkState.medianDurationMs = result.median_ms > 0 ? result.median_ms : fallbackAverageMs;
      benchmarkState.warnings = result.warnings ?? [];
      benchmarkState.dataBytes = result.data_bytes;
      benchmarkState.processedBytes = result.processed_bytes ?? null;
      benchmarkState.runs = result.runs;
      benchmarkState.status = `Completed ${result.runs} run(s)`;
      this.benchmarkStatus = `${benchmarkState.label} completed`;
    } catch (error) {
      benchmarkState.lastDurationMs = null;
      benchmarkState.averageDurationMs = null;
      benchmarkState.medianDurationMs = null;
      benchmarkState.warnings = [];
      benchmarkState.dataBytes = null;
      benchmarkState.processedBytes = null;
      benchmarkState.runs = null;
      benchmarkState.error = error instanceof Error ? error.message : 'Unknown request error';
      benchmarkState.status = 'Request failed';
      this.benchmarkStatus = `${benchmarkState.label} failed`;
    } finally {
      this.isRunningBenchmark = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  protected get selectedDataPreset() {
    return this.dataPresets.find((preset) => preset.id === this.selectedDataPresetId);
  }

  protected get benchmarkStateCards(): BackendBenchmarkState[] {
    return this.backends.map((backend) => this.benchmarkStates[backend.key]);
  }

  protected formatDuration(value: number | null): string {
    return value === null ? '-' : `${value.toFixed(2)} ms`;
  }

  private createBenchmarkState(key: BackendKey, label: string): BackendBenchmarkState {
    return {
      key,
      label,
      lastDurationMs: null,
      averageDurationMs: null,
      medianDurationMs: null,
      status: 'Idle',
      error: null,
      warnings: [],
      dataBytes: null,
      processedBytes: null,
      runs: null,
    };
  }

  private buildEndpoint(path: string): string {
    const baseUrl = environment.apiBaseUrl.trim();
    if (!baseUrl) {
      return path;
    }

    return `${baseUrl.replace(/\/$/, '')}${path}`;
  }
}
