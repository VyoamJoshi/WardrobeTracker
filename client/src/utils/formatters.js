/**
 * Date and URL formatting utilities
 */

export function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Never';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Never';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Never';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return formatShortDate(dateString);
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function resolveImageUrl(url) {
  if (!url) {
    return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
  }

  // Absolute URL or data URI
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  // Images uploaded to the Render backend
  if (url.startsWith('/uploads/')) {
    return `https://wardrobetracker.onrender.com${url}`;
  }

  return url;
}
