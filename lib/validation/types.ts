export type ValidationSeverity = "blocking" | "warning";

export type ValidationResult = {
  checkId: string;
  label: string;
  passed: boolean;
  severity: ValidationSeverity;
  message: string;
  details?: Record<string, unknown>;
};

export type ValidationReport = {
  results: ValidationResult[];
  canPublish: boolean;
};
