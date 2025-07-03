// Command types
export interface CommandResult {
  success: boolean;
  message: string;
}

// Doctor command specific types
export interface VersionInfo {
  local: string | null;
  latest: string | null;
  updateAvailable: boolean;
}

export interface DoctorCheckResult {
  installation: {
    isGlobal: boolean;
    message: string;
  };
  version: VersionInfo;
  nodeVersion: {
    current: string;
    required: string;
    compatible: boolean;
    message: string;
  };
}
