import Icon from "../../components/Icon";
import { Equipe } from "./tipos";

function estado(e: Equipe): { classe: string; rotulo: string } {
  if (e.em_andamento >= 4) return { classe: "carga", rotulo: "Sobrecarga" };
  if (e.em_andamento > 0) return { classe: "campo", rotulo: "Em campo" };
  return { classe: "livre", rotulo: "Disponível" };
}

export default function Equipes({ equipes }: { equipes: Equipe[] }) {
  const porSecretaria = new Map<string, Equipe[]>();

  equipes.forEach((e) => {
    const nome = e.secretaria ?? "Sem secretaria";
    porSecretaria.set(nome, [...(porSecretaria.get(nome) ?? []), e]);
  });

  const comChamados = equipes.filter((e) => e.em_andamento > 0).length;

  return (
    <>
      <div className="cc-admin-cab" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="cc-titulo">Equipes de Campo</h1>
          <p className="cc-subtitulo" style={{ fontSize: 14 }}>Gerenciar alocação e disponibilidade</p>
        </div>
      </div>

      {comChamados > 0 && (
        <div className="cc-alerta">
          <Icon nome="alerta" />
          Há chamados pendentes
        </div>
      )}

      <div className="cc-equipes">
        {Array.from(porSecretaria.entries()).map(([secretaria, lista]) => (
          <div key={secretaria} className="cc-equipe-card">
            <div className="cc-equipe-topo">
              <h4>{secretaria}</h4>
              <small>{lista.length} {lista.length === 1 ? "equipe cadastrada" : "equipes cadastradas"}</small>
            </div>
            {lista.map((e) => {
              const situacao = estado(e);
              return (
                <div key={e.id} className="cc-equipe-linha">
                  <div>
                    <b>{e.nome}</b>
                    <small>
                      {e.atuando
                        ? `Atuando: ${e.atuando} · ${e.em_andamento} ${e.em_andamento === 1 ? "chamado" : "chamados"}`
                        : "Sem chamados no momento"}
                    </small>
                  </div>
                  <span className={`cc-estado ${situacao.classe}`}>{situacao.rotulo}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
