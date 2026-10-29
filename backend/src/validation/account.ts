export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_BYTES = 72;
export const MAX_NAME_LENGTH = 80;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPasswordTooLong(password: string): boolean {
  return Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES;
}

export function signupProblem(name: unknown, email: unknown, password: unknown): string | null {
  if (typeof name !== "string" || !name.trim() || name.trim().length > MAX_NAME_LENGTH) {
    return `Please enter a name of up to ${MAX_NAME_LENGTH} characters`;
  }
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return "Please enter a valid email address";
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (isPasswordTooLong(password)) {
    return `Password is too long (maximum ${MAX_PASSWORD_BYTES} characters)`;
  }
  return null;
}
