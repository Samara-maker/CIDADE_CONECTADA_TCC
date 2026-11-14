import nodemailer from "nodemailer";

// Envio de e-mail pelo Nodemailer (SMTP), em texto simples.
// Se as variáveis SMTP_* não estiverem no .env, o sistema continua funcionando
// e apenas mostra a mensagem no console, sem enviar.

const NOME_SISTEMA = "Cidade Conectada";

const ROTULOS_STATUS: Record<string, string> = {
  registrada: "Registrada",
  em_analise: "Em análise",
  encaminhada: "Encaminhada",
  em_execucao: "Em execução",
  concluida: "Concluída",
  indeferida: "Indeferida",
};

function rotulo(status: string): string {
  return ROTULOS_STATUS[status] ?? status;
}

function criarTransporte() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const porta = Number(SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: porta,
    secure: porta === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function enviar(destinatario: string, assunto: string, linhas: string[]): Promise<void> {
  const texto = [...linhas, `Prefeitura de Ji-Paraná\n${NOME_SISTEMA}`].join("\n\n");
  const transporte = criarTransporte();

  if (!transporte) {
    console.log(`[E-MAIL SIMULADO] SMTP não configurado, nada foi enviado.`);
    console.log(`[E-MAIL SIMULADO] Para: ${destinatario}`);
    console.log(`[E-MAIL SIMULADO] Assunto: ${assunto}`);
    console.log(texto);
    return;
  }

  await transporte.sendMail({
    from: `"${NOME_SISTEMA}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: destinatario,
    subject: assunto,
    text: texto,
  });

  console.log(`[E-MAIL] Enviado para ${destinatario}: ${assunto}`);
}

export async function enviarEmailCadastro(destinatario: string, nome: string): Promise<void> {
  await enviar(destinatario, `Bem-vindo ao ${NOME_SISTEMA}`, [
    `Olá, ${nome}.`,
    "Seu cadastro foi concluído com sucesso. Agora você já pode notificar problemas urbanos e acompanhar cada etapa pelo sistema.",
  ]);
}

export async function enviarEmailConfirmacaoOcorrencia(destinatario: string, protocolo: string): Promise<void> {
  await enviar(destinatario, `Ocorrência registrada, protocolo ${protocolo}`, [
    "Recebemos a sua notificação e ela já está na fila de triagem.",
    `Protocolo: ${protocolo}`,
    "Guarde esse número para acompanhar o andamento no sistema.",
  ]);
}

export async function enviarEmailMudancaStatus(
  destinatario: string,
  protocolo: string,
  statusAnterior: string,
  statusNovo: string,
  mensagem?: string
): Promise<void> {
  const concluida = statusNovo === "concluida";
  const titulo = concluida ? "Sua ocorrência foi concluída" : "Atualização da sua ocorrência";

  const linhas = [
    titulo + ".",
    `Protocolo: ${protocolo}`,
    `Situação: ${rotulo(statusAnterior)} para ${rotulo(statusNovo)}.`,
  ];

  if (mensagem) {
    linhas.push(`Mensagem da prefeitura: ${mensagem}`);
  }

  if (concluida) {
    linhas.push("Entre no sistema e avalie o atendimento. Sua nota ajuda a prefeitura a melhorar.");
  }

  await enviar(destinatario, `${titulo}, protocolo ${protocolo}`, linhas);
}

export async function enviarEmailRecuperacaoSenha(destinatario: string, link: string): Promise<void> {
  await enviar(destinatario, "Recuperação de senha", [
    "Recebemos um pedido para redefinir a sua senha. Para criar uma nova, acesse o link abaixo:",
    link,
    "O link vale por 30 minutos e só pode ser usado uma vez. Se não foi você, ignore esta mensagem.",
  ]);
}