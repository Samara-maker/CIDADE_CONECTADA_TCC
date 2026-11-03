import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import AdminTopbar from "../components/AdminTopbar";
import Icon from "../components/Icon";
import { Resumo } from "../utils/tipos";
import { encerrada, iniciais, mensagemErro } from "../utils/format";
import { useNavigate } from "react-router-dom";
import { CidadaoAdmin, Equipe, OcorrenciaAdmin } from "./admin/tipos";
import Dashboard from "./admin/Dashboard";
import Ocorrencias from "./admin/Ocorrencias";
import Triagem from "./admin/Triagem";
import EquipesCampo from "./admin/Equipes";
import Relatorios from "./admin/Relatorios";
import Cidadaos from "./admin/Cidadaos";
import Configuracoes from "./admin/Configuracoes";
import ModalStatus from "./admin/ModalStatus";

type Secao = "dashboard" | "ocorrencias" | "triagem" | "equipes" | "relatorios" | "cidadaos" | "configuracoes";

const MENU: { id: Secao; rotulo: string; icone: string }[] = [
  { id: "dashboard", rotulo: "Dashboard", icone: "grade" },
  { id: "ocorrencias", rotulo: "Ocorrências", icone: "relogio" },
  { id: "triagem", rotulo: "Triagem Pendente", icone: "calendario" },
  { id: "equipes", rotulo: "Equipes de Campo", icone: "usuarios" },
  { id: "relatorios", rotulo: "Relatórios", icone: "caixa" },
  { id: "cidadaos", rotulo: "Cidadãos", icone: "usuario" },
  { id: "configuracoes", rotulo: "Configurações", icone: "engrenagem" },
];

export default function PainelAdmin() {
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();
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
    <div className="cc-pagina">
      <AdminTopbar />

      <div className="cc-admin">
        <aside className="cc-lateral">
          <nav className="cc-lateral-menu">
            {MENU.map((item) => (
              <button key={item.id} className={`cc-lateral-item ${secao === item.id ? "ativo" : ""}`} onClick={() => setSecao(item.id)}>
                <Icon nome={item.icone} />
                {item.rotulo}
                {item.id === "ocorrencias" && ativas > 0 && <span className="cc-contador">{ativas}</span>}
              </button>
            ))}
          </nav>
          <div className="cc-lateral-rodape">
            <span className="cc-avatar">{iniciais(usuario?.nome ?? "")}</span>
            <div>
              <b style={{ fontSize: 12 }}>{usuario?.nome}</b>
              <small>{usuario?.secretaria ?? "Administrador"}</small>
            </div>
            <button
              onClick={() => {
                sair();
                navegar("/login");
              }}
              title="Sair"
            >
              <Icon nome="sair" />
            </button>
          </div>
        </aside>

        <main className="cc-admin-area">
          {secao === "dashboard" && <Dashboard resumo={resumo} ocorrencias={ocorrencias} aoAtualizar={setEditando} />}
          {secao === "ocorrencias" && <Ocorrencias ocorrencias={ocorrencias} aoAtualizar={setEditando} />}
          {secao === "triagem" && <Triagem ocorrencias={ocorrencias} equipes={equipes} aoMudar={carregar} />}
          {secao === "equipes" && <EquipesCampo equipes={equipes} />}
          {secao === "relatorios" && <Relatorios ocorrencias={ocorrencias} cidadaos={cidadaos} resumo={resumo} />}
          {secao === "cidadaos" && <Cidadaos cidadaos={cidadaos} />}
          {secao === "configuracoes" && <Configuracoes ocorrencias={ocorrencias} />}
        </main>
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
