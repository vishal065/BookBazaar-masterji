import "@dotenvx/dotenvx/config";

export enum EApplicationEnviroment {
  PRODUCTION = "PRODUCTION",
  DEVELOPMENT = "DEVELOPMENT",
}

class EnvSecret {
  public static readonly PORT: number = process.env.PORT
    ? Number(process.env.PORT)
    : 3001;
  public static readonly JWT_SECRET: string =
    process.env.JWT_SECRET || this.throwMissingEnv("JWT_SECRET");
  public static readonly DATABASE_URL: string =
    process.env.DATABASE_URL! || this.throwMissingEnv("DATABASE_URL");
  public static readonly NODE_ENV: EApplicationEnviroment =
    (process.env.NODE_ENV as EApplicationEnviroment) || this.validateNodeEnv();
  // public static readonly API_KEY_SECRET: string = process.env.API_KEY_SECRET || this.throwMissingEnv("API_KEY_SECRET");
  public static readonly SUPER_ADMIN_KEY: string =
    process.env.SUPER_ADMIN_KEY || this.throwMissingEnv("SUPER_ADMIN_KEY");
  public static readonly MAILTRAP_USER: string =
    process.env.MAILTRAP_USER || this.throwMissingEnv("MAILTRAP_USER");
  public static readonly MAILTRAP_PASS: string =
    process.env.MAILTRAP_PASS || this.throwMissingEnv("MAILTRAP_PASS");

  // Mailtrap
  public static readonly MAIL_HOST: string =
    process.env.MAIL_HOST || this.throwMissingEnv("MAIL_HOST");
  public static readonly MAIL_PORT: number = Number(
    process.env.MAIL_PORT || 2525,
  );
  public static readonly MAIL_USER: string =
    process.env.MAIL_USER || this.throwMissingEnv("MAIL_USER");
  public static readonly MAIL_PASS: string =
    process.env.MAIL_PASS || this.throwMissingEnv("MAIL_PASS");
  public static readonly MAIL_FROM_NAME: string =
    process.env.MAIL_FROM_NAME || this.throwMissingEnv("MAIL_FROM_NAME");
  public static readonly MAIL_FROM_EMAIL: string =
    process.env.MAIL_FROM_EMAIL || this.throwMissingEnv("MAIL_FROM_EMAIL");

  // Method to handle missing env variables
  private static throwMissingEnv(name: string): never {
    throw new Error(`Environment variable ${name} is missing`);
  }

  // Method to validate NODE_ENV
  private static validateNodeEnv(): EApplicationEnviroment {
    const nodeEnv = process.env.NODE_ENV as EApplicationEnviroment;
    if (!Object.values(EApplicationEnviroment).includes(nodeEnv)) {
      throw new Error(`Invalid value for NODE_ENV: ${process.env.NODE_ENV}`);
    }
    return nodeEnv;
  }
}

export default EnvSecret;
