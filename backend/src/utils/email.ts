// Envio de e-mail simulado.
// Em produção, substituir pelo nodemailer (ou outro provedor) usando
// as mesmas assinaturas de função abaixo.

export async function enviarEmailCadastro(destinatario: string, nome: string): Promise<void> {
  console.log(`[E-MAIL] Para: ${destinatario}`);
  console.log(`[E-MAIL] Assunto: Bem-vindo ao CidadeConecta`);
  console.log(`[E-MAIL] Olá, ${nome}. Seu cadastro foi concluído com sucesso.`);
}

export async function enviarEmailConfirmacaoOcorrencia(
  destinatario: string,
  protocolo: string
): Promise<void> {
  console.log(`[E-MAIL] Para: ${destinatario}`);
  console.log(`[E-MAIL] Assunto: Ocorrência registrada - Protocolo ${protocolo}`);
  console.log(`[E-MAIL] Sua ocorrência foi registrada com o protocolo ${protocolo}.`);
}

export async function enviarEmailMudancaStatus(
  destinatario: string,
  protocolo: string,
  statusAnterior: string,
  statusNovo: string
): Promise<void> {
  console.log(`[E-MAIL] Para: ${destinatario}`);
  console.log(`[E-MAIL] Assunto: Atualização da ocorrência ${protocolo}`);
  console.log(`[E-MAIL] Status alterado de "${statusAnterior}" para "${statusNovo}".`);
}

export async function enviarEmailRecuperacaoSenha(
  destinatario: string,
  token: string
): Promise<void> {
  console.log(`[E-MAIL] Para: ${destinatario}`);
  console.log(`[E-MAIL] Assunto: Recuperação de senha`);
  console.log(`[E-MAIL] Use o código abaixo para redefinir sua senha: ${token}`);
}
