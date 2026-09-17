let _navigate: (path: string, options?: { state?: Record<string, unknown> }) => void;

export function setNavigate(navigate: typeof _navigate) {
  _navigate = navigate;
}

export function navigate(path: string, options?: { state?: Record<string, unknown> }) {
  _navigate(path, options);
}
