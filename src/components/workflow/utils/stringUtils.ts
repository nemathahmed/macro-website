
/**
 * Formats a function name for display by:
 * - Converting underscores to spaces
 * - Capitalizing words
 * - Removing common prefixes like 'mock_'
 */
export const formatFunctionName = (functionName: string): string => {
  if (!functionName) return 'Unknown Function';
  
  // Remove common prefixes like 'mock_'
  let displayName = functionName.replace(/^mock_/, '');
  
  // Convert underscores to spaces and capitalize each word
  return displayName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncates text with ellipsis if it exceeds the maximum length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formats a URL for display by removing protocol and trailing slashes
 */
export const formatUrl = (url: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}; 

/**
 * Creates a shortened version of a long prompt for display
 */
export const shortenPrompt = (prompt: string): string => {
  // Extract first few words (up to 5)
  const words = prompt.split(' ');
  const shortened = words.slice(0, 4).join(' ');
  
  // If original prompt is longer than what we've shortened it to, add ellipsis
  return words.length > 4 ? `${shortened}...` : shortened;
};
