import type { ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import * as css from "./Login.css.js";

export const action_login = async ({ body, c }: ActionArgs<{ email: string; password: string }>) => {
    const { authenticate } = await import("../modules/users/user.services.js");
    const result = await authenticate(body.email, body.password);

    if (!result) {
        return { error: "Invalid email or password" };
    }

    const { setCookie } = await import("@mauroandre/velojs/cookie");
    setCookie(c!, "session", result.token, {
        path: "/",
        httpOnly: true,
        secure: process.env["COOKIE_SECURE"] === "true",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 30,
    });

    return { ok: true };
};

export const action_logout = async ({ c }: ActionArgs<{}>) => {
    const { deleteCookie } = await import("@mauroandre/velojs/cookie");
    deleteCookie(c!, "session", { path: "/" });
    return { ok: true };
};

export const Component = () => {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const error = useSignal("");
    const loading = useSignal(false);

    const handleSubmit = useCallback(async (e: Event) => {
        e.preventDefault();
        const email = emailRef.current?.value.trim();
        const password = passwordRef.current?.value;
        if (!email || !password) return;

        loading.value = true;
        error.value = "";

        const result = await action_login({ body: { email, password } }) as any;

        if (result.error) {
            error.value = result.error;
            loading.value = false;
            return;
        }

        window.location.href = "/";
    }, []);

    return (
        <div class={css.page}>
            <form class={css.card} onSubmit={handleSubmit}>
                <h1 class={css.title}>my-ha</h1>

                <div class={css.inputGroup}>
                    <label class={css.inputLabel}>Email</label>
                    <input
                        ref={emailRef}
                        class={css.input}
                        type="email"
                        autoComplete="email"
                        autoFocus
                    />
                </div>

                <div class={css.inputGroup}>
                    <label class={css.inputLabel}>Password</label>
                    <input
                        ref={passwordRef}
                        class={css.input}
                        type="password"
                        autoComplete="current-password"
                    />
                </div>

                {error.value && <div class={css.error}>{error.value}</div>}

                <button class={css.submitButton} type="submit" disabled={loading.value}>
                    {loading.value ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </div>
    );
};
