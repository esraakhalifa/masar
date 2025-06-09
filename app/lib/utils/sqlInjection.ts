// Common SQL injection patterns to check for
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,  // SQL comments and string terminators
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,  // SQL injection with = operator
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,  // SQL injection with OR
  /((\%27)|(\'))union/i,  // SQL injection with UNION
  /exec(\s|\+)+(s|x)p\w+/i,  // SQL injection with stored procedures
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,  // SQL injection with comments
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,  // SQL injection with = operator
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,  // SQL injection with OR
  /((\%27)|(\'))union/i,  // SQL injection with UNION
  /exec(\s|\+)+(s|x)p\w+/i,  // SQL injection with stored procedures
];

// Check if a string contains SQL injection patterns
export const containsSQLInjection = (input: string): boolean => {
  if (!input) return false;
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
};

// Sanitize input to prevent SQL injection
export const sanitizeSQLInput = (input: string): string => {
  if (!input) return '';
  
  // Remove SQL injection patterns
  let sanitized = input;
  SQL_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Additional sanitization
  sanitized = sanitized
    .replace(/[;'"\\]/g, '') // Remove SQL special characters
    .trim();
    
  return sanitized;
};

// Validate and sanitize an object's string values
export const sanitizeObjectForSQL = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      if (containsSQLInjection(value)) {
        throw new Error(`Potential SQL injection detected in field: ${key}`);
      }
      sanitized[key] = sanitizeSQLInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeSQLInput(item) : 
        typeof item === 'object' ? sanitizeObjectForSQL(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObjectForSQL(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}; 