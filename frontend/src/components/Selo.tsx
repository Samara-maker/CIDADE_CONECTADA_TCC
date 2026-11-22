import { selo } from "../utils/format";

const CORES: Record<string, string> = {
  urgente: "bg-danger",
  aberto: "bg-warning text-dark",
  andamento: "bg-primary",
  resolvido: "bg-success",
  indeferido: "bg-secondary",
};

export default function Selo({ status, urgencia }: { status: string; urgencia: string }) {
  const etiqueta = selo(status, urgencia);

  return <span className={`badge rounded-pill ${CORES[etiqueta.classe] ?? "bg-secondary"}`}>{etiqueta.rotulo}</span>;
}