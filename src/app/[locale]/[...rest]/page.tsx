import { notFound } from "next/navigation";

// Qualquer caminho que não existe cai aqui, pra 404 sair com o layout e no idioma certo.
export default function CatchAll() {
  notFound();
}
