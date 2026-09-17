export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  exception: string | null;
  machineName: string | null;
  userName: string | null;
  requestPath: string | null;
  application: string | null;
}

export interface LogStats {
  total: number;
  errorsToday: number;
  warningsToday: number;
  infoToday: number;
}

export interface LogFilters {
  page?: number;
  pageSize?: number;
  level?: string;
  from?: string;
  to?: string;
  search?: string;
}
