import { selo } from "../utils/format";

export default function Selo({ status, urgencia }: { status: string; urgencia: string }) {
  const etiqueta = selo(status, urgencia);

  return (
    <span className={`cc-selo ${etiqueta.classe}`}>
      <i />
      {etiqueta.rotulo}
    </span>
  );
}
