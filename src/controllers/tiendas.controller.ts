import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../db";

interface TiendaInput {
  id?: string;
  nombre?: string;
  tipo?: string;
  categoria?: string;
  ciudad?: string;
  direccion?: string;
  distanciaKm?: number;
  rating?: number;
  reviews?: number;
  telefono?: string;
  horario?: string;
  abierto?: boolean;
  destacado?: boolean;
  inicial?: string;
  colorAcento?: string;
  imagen?: string;
}

const tiendaSelect = {
  id: true,
  nombre: true,
  tipo: true,
  categoria: true,
  ciudad: true,
  direccion: true,
  distanciaKm: true,
  rating: true,
  reviews: true,
  telefono: true,
  horario: true,
  abierto: true,
  destacado: true,
  inicial: true,
  colorAcento: true,
  imagen: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TiendaSelect;

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === true || value === "true";
}

function imageUrl(id: string): string {
  return `/api/tiendas/${encodeURIComponent(id)}/imagen?v=${Date.now()}`;
}

function imageBytes(file: Express.Multer.File): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(file.buffer.byteLength);
  bytes.set(file.buffer);
  return bytes;
}

function validate(p: TiendaInput): string | null {
  if (!p.id) return "El id es obligatorio";
  if (!p.nombre) return "El nombre es obligatorio";
  if (!p.tipo) return "El tipo es obligatorio";
  if (!p.categoria) return "La categoría es obligatoria";
  if (!p.ciudad) return "La ciudad es obligatoria";
  if (!p.direccion) return "La dirección es obligatoria";
  if (p.distanciaKm === undefined || p.distanciaKm < 0)
    return "La distancia debe ser mayor o igual a 0";
  if (p.rating === undefined || p.rating < 0 || p.rating > 5)
    return "El rating debe estar entre 0 y 5";
  if (p.reviews === undefined || p.reviews < 0)
    return "Reviews debe ser mayor o igual a 0";
  if (!p.telefono) return "El teléfono es obligatorio";
  if (!p.horario) return "El horario es obligatorio";
  if (!p.inicial || p.inicial.length > 3)
    return "La inicial debe tener máximo 3 caracteres";
  if (!p.colorAcento) return "El color de acento es obligatorio";
  return null;
}

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const tiendas = await prisma.tienda.findMany({
      select: tiendaSelect,
      orderBy: { updatedAt: "desc" },
    });
    res.json({ data: tiendas });
  } catch (err) {
    console.error("[tiendas.list]", err);
    res.status(500).json({ error: "Error al listar tiendas" });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const tienda = await prisma.tienda.findUnique({
      where: { id: req.params.id },
      select: tiendaSelect,
    });
    if (!tienda) {
      res.status(404).json({ error: "Tienda no encontrada" });
      return;
    }
    res.json({ data: tienda });
  } catch (err) {
    console.error("[tiendas.getOne]", err);
    res.status(500).json({ error: "Error al obtener tienda" });
  }
}

export async function getImage(req: Request, res: Response): Promise<void> {
  try {
    const tienda = await prisma.tienda.findUnique({
      where: { id: req.params.id },
      select: { imagenData: true, imagenMimeType: true, updatedAt: true },
    });
    if (!tienda?.imagenData) {
      res.status(404).json({ error: "Imagen no encontrada" });
      return;
    }

    const image = Buffer.from(tienda.imagenData);
    res.set({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(image.length),
      "Content-Type": tienda.imagenMimeType || "application/octet-stream",
      ETag: `"${req.params.id}-${tienda.updatedAt.getTime()}-${image.length}"`,
    });
    res.send(image);
  } catch (err) {
    console.error("[tiendas.getImage]", err);
    res.status(500).json({ error: "Error al obtener imagen" });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body: TiendaInput = req.body;
    const error = validate(body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const exists = await prisma.tienda.findUnique({
      where: { id: body.id! },
      select: { id: true },
    });
    if (exists) {
      res.status(409).json({ error: "Ya existe una tienda con ese ID" });
      return;
    }

    const tienda = await prisma.tienda.create({
      data: {
        id: body.id!,
        nombre: body.nombre!,
        tipo: body.tipo!,
        categoria: body.categoria!,
        ciudad: body.ciudad!,
        direccion: body.direccion!,
        distanciaKm: Number(body.distanciaKm),
        rating: Number(body.rating),
        reviews: Number(body.reviews),
        telefono: body.telefono!,
        horario: body.horario!,
        abierto: toBoolean(body.abierto, true),
        destacado: toBoolean(body.destacado, false),
        inicial: body.inicial!,
        colorAcento: body.colorAcento!,
        imagen: req.file ? imageUrl(body.id!) : body.imagen ?? "",
        imagenData: req.file ? imageBytes(req.file) : undefined,
        imagenMimeType: req.file?.mimetype,
      },
      select: tiendaSelect,
    });

    res.status(201).json({ data: tienda });
  } catch (err) {
    console.error("[tiendas.create]", err);
    res.status(500).json({ error: "Error al crear tienda" });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const body: TiendaInput = req.body;
    const id = req.params.id;

    const exists = await prisma.tienda.findUnique({
      where: { id },
      select: tiendaSelect,
    });
    if (!exists) {
      res.status(404).json({ error: "Tienda no encontrada" });
      return;
    }

    const removeImage = !req.file && body.imagen === "";
    const imageUpdate = req.file
      ? {
          imagen: imageUrl(id),
          imagenData: imageBytes(req.file),
          imagenMimeType: req.file.mimetype,
        }
      : removeImage
        ? { imagen: "", imagenData: null, imagenMimeType: null }
        : {};

    const tienda = await prisma.tienda.update({
      where: { id },
      data: {
        nombre: body.nombre ?? exists.nombre,
        tipo: body.tipo ?? exists.tipo,
        categoria: body.categoria ?? exists.categoria,
        ciudad: body.ciudad ?? exists.ciudad,
        direccion: body.direccion ?? exists.direccion,
        distanciaKm:
          body.distanciaKm !== undefined
            ? Number(body.distanciaKm)
            : exists.distanciaKm,
        rating:
          body.rating !== undefined ? Number(body.rating) : exists.rating,
        reviews:
          body.reviews !== undefined ? Number(body.reviews) : exists.reviews,
        telefono: body.telefono ?? exists.telefono,
        horario: body.horario ?? exists.horario,
        abierto: toBoolean(body.abierto, exists.abierto),
        destacado: toBoolean(body.destacado, exists.destacado),
        inicial: body.inicial ?? exists.inicial,
        colorAcento: body.colorAcento ?? exists.colorAcento,
        ...imageUpdate,
      },
      select: tiendaSelect,
    });

    res.json({ data: tienda });
  } catch (err) {
    console.error("[tiendas.update]", err);
    res.status(500).json({ error: "Error al actualizar tienda" });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const exists = await prisma.tienda.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!exists) {
      res.status(404).json({ error: "Tienda no encontrada" });
      return;
    }
    await prisma.tienda.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error("[tiendas.remove]", err);
    res.status(500).json({ error: "Error al eliminar tienda" });
  }
}
