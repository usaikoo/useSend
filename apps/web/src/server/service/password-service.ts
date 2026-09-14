import bcrypt from "bcryptjs";

const PASSWORD_SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export class PasswordService {
  static validatePassword(password: string) {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
  }

  static async hash(password: string) {
    this.validatePassword(password);
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  }

  static async verify(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }
}
