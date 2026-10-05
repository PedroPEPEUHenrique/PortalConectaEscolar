if (typeof window !== "undefined") {
  throw new Error(
    "[arquitetura] Módulo exclusivo de servidor importado no cliente. " +
      "Páginas devem falar com o backend via @/lib/api-client, e importar " +
      "apenas os arquivos schema.ts/policy.ts dos módulos."
  );
}

export {};
