type DashboardRefreshListener = () => void;

const listeners = new Set<DashboardRefreshListener>();

export function subscribeToDashboardRefresh(listener: DashboardRefreshListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyDashboardRefresh() {
  listeners.forEach((listener) => listener());

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("brainops:dashboard-refresh"));
  }
}
