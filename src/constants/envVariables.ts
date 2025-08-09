import '@dotenvx/dotenvx/config'

export enum EApplicationEnviroment {
    PRODUCTION = "production",
    DEVELOPMENT = "development",
}
class EnvSecret {
    public static readonly PORT = process.env.PORT || 3001
    public static readonly JWT_SECRET = process.env.JWT_SECRET || "supersecret"
    public static readonly DATABASE_URL = process.env.DATABASE_URL!

    public static readonly NODE_ENV = process.env.NODE_ENV || "development"
    public static readonly API_KEY_SECRET = process.env.API_KEY_SECRET
}

export default EnvSecret