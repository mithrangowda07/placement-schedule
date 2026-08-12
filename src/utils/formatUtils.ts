/**
 * Format string as uppercase currency / package string if numeric or keep as clean string.
 */
export function formatPackage(pkg: string): string {
  if (!pkg) return 'N/A';
  const trimmed = pkg.trim();
  if (trimmed.toLowerCase().includes('lpa') || trimmed.toLowerCase().includes('k')) {
    return trimmed;
  }
  return `${trimmed} LPA`;
}

/**
 * Truncate long text strings cleanly with ellipsis.
 */
export function truncateText(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Get initials from company name for fallback logos.
 */
export function getCompanyInitials(name: string): string {
  if (!name) return 'RV';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
