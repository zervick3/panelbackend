import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email y contraseña son obligatorios" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const token = signToken({ sub: user.id, email: user.email, name: user.name });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("[auth.login]", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  res.json({ user: req.user });
}
