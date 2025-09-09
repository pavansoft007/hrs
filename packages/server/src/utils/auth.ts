import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { User } from "../models/index.js";

interface JWTPayload {
  id: number;
  email: string;
  user_type: "MASTER_ADMIN" | "PROPERTY_ADMIN" | "STAFF";
  property_id?: number;
}

export class AuthUtils {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRES_IN: string =
    process.env.JWT_EXPIRES_IN || "24h";
  private static readonly REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";
  private static readonly REFRESH_TOKEN_EXPIRES_IN: string =
    process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: "hms-system",
    } as any);
  }

  /**
   * Generate JWT refresh token
   */
  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: "hms-system",
    } as any);
  }

  /**
   * Verify JWT access token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify JWT refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(): string {
    const options: SignOptions = { expiresIn: "1h" };
    return jwt.sign(
      { type: "password-reset", timestamp: Date.now() },
      this.JWT_SECRET,
      options
    );
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): boolean {
    try {
      jwt.verify(token, this.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static async generateTokens(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      property_id: user.property_id || undefined,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Store refresh token in database
    await user.update({ refresh_token: refreshToken });

    return { accessToken, refreshToken };
  }

  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(userId: number): Promise<void> {
    await User.update({ refresh_token: undefined }, { where: { id: userId } });
  }
}
