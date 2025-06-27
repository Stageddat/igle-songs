export function validateAdminPassword(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        isValid: false,
        error: "missing or invalid authorization header",
      };
    }

    const password = authHeader.substring(7);
    const masterPassword = process.env.MASTER_PASSWORD;

    if (!masterPassword) {
      console.error("master password not configured in environment variables");
      return {
        isValid: false,
        error: "server configuration error",
      };
    }

    if (password !== masterPassword) {
      return {
        isValid: false,
        error: "invalid password",
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    console.error("error validating password:", error);
    return {
      isValid: false,
      error: "authentication error",
    };
  }
}
