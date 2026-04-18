import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userSchema } from "./user.schemas.js";
import type { User, UserRole, PublicUser } from "./user.schemas.js";
import * as repo from "./user.repository.js";

const BCRYPT_COST = 12;
const JWT_EXPIRES_IN = "30d";

function getJwtSecret(): string {
    const secret = process.env["JWT_SECRET"];
    if (!secret) throw new Error("JWT_SECRET is not set");
    return secret;
}

// --- User management ---

export async function createUser(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}) {
    const existing = await repo.findUserByEmail(data.email);
    if (existing) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST);

    const user = userSchema.parse({
        id: null,
        createdAt: null,
        updatedAt: null,
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
    });

    await repo.saveUser(user);
    return user;
}

export async function getAllUsers() {
    return repo.findAllUsers();
}

export async function getUserById(id: string) {
    return repo.findUserById(id);
}

// --- Auth ---

export async function authenticate(email: string, password: string): Promise<{ token: string; user: PublicUser } | null> {
    const user = await repo.findUserByEmail(email);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN },
    );

    return {
        token,
        user: {
            id: user.id!,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    };
}

export function verifyToken(token: string): { userId: string; role: UserRole } | null {
    try {
        const payload = jwt.verify(token, getJwtSecret()) as { userId: string; role: UserRole };
        return payload;
    } catch {
        return null;
    }
}

export function toPublicUser(user: User): PublicUser {
    return {
        id: user.id!,
        email: user.email,
        name: user.name,
        role: user.role,
    };
}

// --- Master bootstrap ---

export async function ensureMasterUser() {
    const users = await repo.findAllUsers();
    if (users.length > 0) return;

    const email = process.env["DEFAULT_MASTER_EMAIL"];
    const password = process.env["DEFAULT_MASTER_PASSWORD"];

    if (!email || !password) {
        console.log("[users] No users yet, but DEFAULT_MASTER_EMAIL/PASSWORD not set");
        return;
    }

    await createUser({
        email,
        password,
        name: "Master",
        role: "master",
    });

    console.log(`[users] Master user created: ${email}`);
}
