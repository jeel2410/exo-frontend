/**
 * Simple HTML sanitizer utility to clean up content before rendering
 * This removes potentially dangerous HTML while preserving basic formatting
 */

export const sanitizeHtmlContent = (htmlContent: string): string => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // Remove script tags and their content completely
  let sanitized = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/(on\w+|javascript:|data:(?!image))/gi, '');
  
  // Clean up excessive whitespace but preserve line breaks
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Ensure proper paragraph spacing
  sanitized = sanitized.replace(/<\/p>\s*<p>/gi, '</p><p>');
  
  return sanitized;
};

/**
 * Convert plain text with HTML tags to properly formatted HTML
 */
export const formatHtmlContent = (content: string): string => {
  if (!content) return '';
  
  let formatted = sanitizeHtmlContent(content);
  
  // If content doesn't have proper HTML structure, wrap in paragraph tags
  if (!formatted.includes('<p>') && !formatted.includes('<div>') && formatted.length > 0) {
    // Split by double line breaks to create paragraphs
    const paragraphs = formatted.split(/\n\s*\n/);
    formatted = paragraphs
      .filter(p => p.trim())
      .map(p => `<p>${p.trim()}</p>`)
      .join('');
  }
  
  return formatted;
};
