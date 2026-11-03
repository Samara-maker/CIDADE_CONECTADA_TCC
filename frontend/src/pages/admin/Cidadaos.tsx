import { useState } from "react";
import Icon from "../../components/Icon";
import { formatarData, nivelCidadao } from "../../utils/format";
import { CidadaoAdmin } from "./tipos";

export default function Cidadaos({ cidadaos }: { cidadaos: CidadaoAdmin[] }) {
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState<CidadaoAdmin | null>(null);

  // o painel mostra os mais antigos primeiro, para o código USR-001 ser estável
  const ordenados = [...cidadaos].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());
  const termo = busca.trim().toLowerCase();
  const lista = ordenados
    .map((c, indice) => ({ ...c, codigo: `USR-${String(indice + 1).padStart(3, "0")}` }))
    .filter((c) => !termo || `${c.nome} ${c.email} ${c.codigo}`.toLowerCase().includes(termo));

  return (
    <>
      <div className="cc-admin-cab">
        <div>
          <h1 className="cc-titulo">Gestão de Cidadãos</h1>
          <p className="cc-subtitulo" style={{ fontSize: 14 }}>{cidadaos.length} usuários cadastrados</p>
        </div>
        <div className="cc-busca-adm">
          <input placeholder="Pesquise aqui" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Icon nome="busca" />
        </div>
      </div>

      <div className="cc-tabela-wrap">
        <table className="cc-tabela">
          <thead>
            <tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Ocorrências</th><th>Nível</th><th>Cadastro</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {lista.map((c) => {
              const nivel = nivelCidadao(c.total_ocorrencias);
              return (
                <tr key={c.id}>
                  <td className="esq">{c.codigo}</td>
                  <td>{c.nome}</td>
                  <td>{c.email}</td>
                  <td>{c.total_ocorrencias}</td>
                  <td><span className={`cc-nivel ${nivel}`}>{nivel === "ouro" ? "Ouro" : nivel === "prata" ? "Prata" : "Bronze"}</span></td>
                  <td>{formatarData(c.criado_em)}</td>
                  <td><button className="cc-btn-ver" onClick={() => setPerfil(c)}>Ver Perfil</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length === 0 && <div className="cc-vazio">Nenhum cidadão encontrado.</div>}
      </div>

      {perfil && (
        <div className="cc-fundo" onClick={() => setPerfil(null)}>
          <div className="cc-janela" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-janela-miolo">
              <button className="cc-fechar" onClick={() => setPerfil(null)}><Icon nome="cruz" tamanho={14} /></button>
              <h3 style={{ fontSize: 20 }}>{perfil.nome}</h3>
              <p><b>E-mail:</b> {perfil.email}</p>
              <p><b>Telefone:</b> {perfil.telefone || "Não informado"}</p>
              <p><b>Ocorrências registradas:</b> {perfil.total_ocorrencias}</p>
              <p><b>Cadastro:</b> {formatarData(perfil.criado_em)}</p>
              <p><b>Situação:</b> {perfil.ativo ? "Ativo" : "Inativo"}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
