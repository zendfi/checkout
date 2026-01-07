import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function CheckIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function WalletIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
      <path strokeWidth="2" d="M16 10h.01" />
    </svg>
  );
}

export function WarningIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
    </svg>
  );
}

export function ErrorIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CopyIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
      <path strokeWidth="2" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function ClockIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DollarIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" />
      <path strokeWidth="2" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function LightningIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
      <path strokeWidth="2" d="M12 18h.01" />
    </svg>
  );
}

export function RefreshIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <polyline points="23 4 23 10 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="1 20 1 14 7 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeWidth="2" d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function InfoIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
      <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
    </svg>
  );
}

export function GlobeIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
      <path strokeWidth="2" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function SettingsIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
      <path strokeWidth="2" d="M12 1v6m0 6v6m5.2-13c.5.9.8 1.9.8 3s-.3 2.1-.8 3m-10.4 0C6.3 14.1 6 13.1 6 12s.3-2.1.8-3m8.5 8.5l-4.2-4.2M8.7 8.7l4.2 4.2" />
    </svg>
  );
}

export function WifiIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeWidth="2" d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path strokeWidth="2" d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path strokeWidth="2" d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2" />
    </svg>
  );
}

export function SwitchIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <polyline points="17 1 21 5 17 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeWidth="2" d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeWidth="2" d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function TriangleAlertIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeWidth="2" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
    </svg>
  );
}

export function WrenchIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeWidth="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
