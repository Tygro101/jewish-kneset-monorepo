import './DashboardShell.scss';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Single layout owner for the portrait dashboard composition.
 * Used by both tablet (ClockView) and TV (TvClockView dashboard column).
 * Declares a size container so all child cq units resolve consistently.
 */
export const DashboardShell = ({ children }: DashboardShellProps) => (
  <div className="dashboard-shell">{children}</div>
);
