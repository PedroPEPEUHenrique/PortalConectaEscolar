import type { NextRequest } from "next/server";
import { responderOk, rota, validarParam } from "@/lib/http";
import { POLITICAS } from "@/lib/rate-limit";
import { cargoSchema } from "@/modules/perfis/schema";
import { listarUsuarios } from "@/modules/perfis/service";

export const GET = rota(async (request: NextRequest) => {
  const cargo = request.nextUrl.searchParams.get("cargo");
  const cargoFiltro = cargo ? validarParam(cargoSchema, cargo, "Cargo") : undefined;

  return responderOk(await listarUsuarios(cargoFiltro));
}, POLITICAS.leitura);
