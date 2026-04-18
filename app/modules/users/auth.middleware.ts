import { createMiddleware } from "@mauroandre/velojs/factory";
import { getCookie } from "@mauroandre/velojs/cookie";

export const authMiddleware = createMiddleware(async (c, next) => {
    const token = getCookie(c, "session");

    if (!token) {
        if (c.req.method === "GET") return c.redirect("/login");
        return c.json({ error: "unauthorized" }, 401);
    }

    const { verifyToken, getUserById, toPublicUser } = await import("./user.services.js");
    const payload = verifyToken(token);

    if (!payload) {
        if (c.req.method === "GET") return c.redirect("/login");
        return c.json({ error: "unauthorized" }, 401);
    }

    const user = await getUserById(payload.userId);
    if (!user) {
        if (c.req.method === "GET") return c.redirect("/login");
        return c.json({ error: "unauthorized" }, 401);
    }

    c.set("user", toPublicUser(user));
    await next();
});
