import '@dotenvx/dotenvx/config'

export enum EApplicationEnviroment {
    PRODUCTION = "PRODUCTION",
    DEVELOPMENT = "DEVELOPMENT",
}
class EnvSecret {
    public static readonly PORT = process.env.PORT || 3001
    public static readonly JWT_SECRET = process.env.JWT_SECRET || "supersecret"
    public static readonly DATABASE_URL = process.env.DATABASE_URL!

    public static readonly NODE_ENV = process.env.NODE_ENV as EApplicationEnviroment
    public static readonly API_KEY_SECRET = process.env.API_KEY_SECRET

    public static readonly SUPER_ADMIN_KEY = process.env.SUPER_ADMIN_KEY

    public static readonly MAILTRAP_USER = process.env.MAILTRAP_USER
    public static readonly MAILTRAP_PASS = process.env.MAILTRAP_PASS

    // Mailtrap
    public static readonly MAIL_HOST = process.env.MAIL_HOST
    public static readonly MAIL_PORT = Number(process.env.MAIL_PORT || 2525)
    public static readonly MAIL_USER = process.env.MAIL_USER
    public static readonly MAIL_PASS = process.env.MAIL_PASS
    public static readonly MAIL_FROM_NAME = process.env.MAIL_FROM_NAME
    public static readonly MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL

}

export default EnvSecret