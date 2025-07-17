import '@dotenvx/dotenvx/config'
class EnvSecret {
    public static readonly PORT = process.env.PORT || 3001
    public static readonly JWT_SECRET = process.env.JWT_SECRET || "supersecret"
    public static readonly DATABASE_URL = process.env.DATABASE_URL!
}

export default EnvSecret