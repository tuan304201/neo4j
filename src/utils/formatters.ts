import { 
  SEVERITY_COLORS, 
  STATUS_COLORS 
} from './constants';
import { AlertSeverity, AlertStatus } from '../types/alert.types';

/**
 * Format a date string to a localized date and time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
}

/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) {
    return `${diffInSecs} second${diffInSecs !== 1 ? 's' : ''} ago`;
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Get the CSS class for alert severity
 */
export function getSeverityClass(severity: AlertSeverity): string {
  return SEVERITY_COLORS[severity] || 'bg-gray-400';
}

/**
 * Get the CSS class for alert status
 */
export function getStatusClass(status: AlertStatus): string {
  return STATUS_COLORS[status] || 'bg-gray-400';
}

/**
 * Truncate text with ellipsis if it exceeds the specified length
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format a number or percentage value for display
 */
export function formatValue(value: number | string): string {
  if (typeof value === 'string') {
    return value;
  }
  
  // Determine if we should use percentage format
  if (value >= 0 && value <= 1) {
    return `${(value * 100).toFixed(1)}%`;
  }
  
  // Format large numbers with K, M, etc.
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return value.toString();
}

/**
 * Capitalize the first letter of each word in a string
 */
export function titleCase(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}