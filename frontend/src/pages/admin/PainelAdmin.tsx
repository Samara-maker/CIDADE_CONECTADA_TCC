import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import AdminTopbar from "../components/AdminTopbar";
import { Resumo } from "../utils/tipos";
import { encerrada, mensagemErro } from "../utils/format";
import { CidadaoAdmin, Equipe, OcorrenciaAdmin } from "./admin/tipos";
import Dashboard from "./admin/Dashboard";
import Ocorrencias from "./admin/Ocorrencias";
import Triagem from "./admin/Triagem";
import EquipesCampo from "./admin/Equipes";
import Relatorios from "./admin/Relatorios";
import Cidadaos from "./admin/Cidadaos";
import Configuracoes from "./admin/Configuracoes";
import ModalStatus from "./admin/ModalStatus";

type Secao = "dashboard" | "ocorrencias" | "triagem" | "cidadaos" | "equipes" | "relatorios" | "configuracoes";

const MENU: { id: Secao; rotulo: string }[] = [
  { id: "dashboard", rotulo: "Dashboard" },
  { id: "ocorrencias", rotulo: "Ocorrências" },
  { id: "triagem", rotulo: "Triagem pendente" },
  { id: "cidadaos", rotulo: "Cidadãos" },
  { id: "equipes", rotulo: "Equipes de campo" },
  { id: "relatorios", rotulo: "Relatórios" },
  { id: "configuracoes", rotulo: "Configurações" },
];

export default function PainelAdmin() {
  const aviso = useToast();

  const [secao, setSecao] = useState<Secao>("dashboard");
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaAdmin[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [cidadaos, setCidadaos] = useState<CidadaoAdmin[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [editando, setEditando] = useState<OcorrenciaAdmin | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [o, e, c, r] = await Promise.all([
        api.get("/ocorrencias"),
        api.get("/admin/equipes"),
        api.get("/admin/cidadaos"),
        api.get("/publico/resumo"),
      ]);
      setOcorrencias(o.data);
      setEquipes(e.data);
      setCidadaos(c.data);
      setResumo(r.data);
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível carregar os dados do painel."), "erro");
    }
  }, [aviso]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const ativas = ocorrencias.filter((o) => !encerrada(o.status)).length;

  return (
    <div className="bg-light min-vh-100">
      <AdminTopbar />

      <div className="container-fluid">
        <div className="row">
          <aside className="col-md-3 col-xl-2 bg-white border-end p-3" style={{ minHeight: "calc(100vh - 58px)" }}>
            <div className="nav nav-pills flex-md-column gap-1">
              {MENU.map((item) => (
                <button
                  key={item.id}
                  className={`nav-link text-start d-flex justify-content-between align-items-center ${secao === item.id ? "active bg-success" : "text-dark"}`}
                  onClick={() => setSecao(item.id)}
                >
                  {item.rotulo}
                  {item.id === "ocorrencias" && ativas > 0 && <span className="badge text-bg-light ms-2">{ativas}</span>}
                </button>
              ))}
            </div>
          </aside>

          <main className="col-md-9 col-xl-10 p-3 p-md-4">
            {secao === "dashboard" && <Dashboard resumo={resumo} ocorrencias={ocorrencias} aoAtualizar={setEditando} />}
            {secao === "ocorrencias" && <Ocorrencias ocorrencias={ocorrencias} aoAtualizar={setEditando} />}
            {secao === "triagem" && <Triagem ocorrencias={ocorrencias} equipes={equipes} aoMudar={carregar} />}
            {secao === "cidadaos" && <Cidadaos cidadaos={cidadaos} />}
            {secao === "equipes" && <EquipesCampo />}
            {secao === "relatorios" && <Relatorios />}
            {secao === "configuracoes" && <Configuracoes />}
          </main>
        </div>
      </div>

      {editando && (
        <ModalStatus
          ocorrencia={editando}
          equipes={equipes}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}
