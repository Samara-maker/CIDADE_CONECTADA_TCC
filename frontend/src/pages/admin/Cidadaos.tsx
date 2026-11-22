import { useState } from "react";
import Janela from "../../components/Janela";
import { formatarData, nivelCidadao } from "../../utils/format";
import { CidadaoAdmin } from "./tipos";

const NIVEIS = {
  ouro: { rotulo: "Ouro", classe: "text-bg-warning" },
  prata: { rotulo: "Prata", classe: "text-bg-secondary" },
  bronze: { rotulo: "Bronze", classe: "text-bg-dark" },
};

export default function Cidadaos({ cidadaos }: { cidadaos: CidadaoAdmin[] }) {
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState<CidadaoAdmin | null>(null);

  // os mais antigos primeiro, para o código USR-001 ser estável
  const ordenados = [...cidadaos].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
  const termo = busca.trim().toLowerCase();
  const lista = ordenados
    .map((c, indice) => ({ ...c, codigo: `USR-${String(indice + 1).padStart(3, "0")}` }))
    .filter((c) => !termo || `${c.nome} ${c.email} ${c.codigo}`.toLowerCase().includes(termo));

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-0">Gestão de cidadãos</h1>
          <small className="text-muted">{cidadaos.length} usuários cadastrados</small>
        </div>
        <input
          className="form-control w-auto"
          placeholder="Pesquise aqui"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Ocorrências</th>
                <th>Nível</th>
                <th>Cadastro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => {
                const nivel = NIVEIS[nivelCidadao(c.total_ocorrencias)];
                return (
                  <tr key={c.id}>
                    <td>{c.codigo}</td>
                    <td>{c.nome}</td>
                    <td>{c.email}</td>
                    <td>{c.total_ocorrencias}</td>
                    <td><span className={`badge ${nivel.classe}`}>{nivel.rotulo}</span></td>
                    <td>{formatarData(c.criado_em)}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-success btn-sm" onClick={() => setPerfil(c)}>Ver perfil</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {lista.length === 0 && <p className="text-center text-muted py-4 mb-0">Nenhum cidadão encontrado.</p>}
      </div>

      {perfil && (
        <Janela titulo={perfil.nome} aoFechar={() => setPerfil(null)}>
          <p className="mb-2"><b>E-mail:</b> {perfil.email}</p>
          <p className="mb-2"><b>Telefone:</b> {perfil.telefone || "Não informado"}</p>
          <p className="mb-2"><b>Ocorrências registradas:</b> {perfil.total_ocorrencias}</p>
          <p className="mb-2"><b>Cadastro:</b> {formatarData(perfil.criado_em)}</p>
          <p className="mb-0"><b>Situação:</b> {perfil.ativo ? "Ativo" : "Inativo"}</p>
        </Janela>
      )}
    </>
  );
}
