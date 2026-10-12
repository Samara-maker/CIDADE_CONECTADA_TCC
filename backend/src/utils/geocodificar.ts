// Converte o endereço digitado em latitude e longitude usando o Nominatim (OpenStreetMap).
// Se o serviço não responder, usa o centro de Ji-Paraná com um pequeno deslocamento
// para que as ocorrências não fiquem todas empilhadas no mesmo ponto do mapa.

const CENTRO = { latitude: -10.8777, longitude: -61.9322 };

export async function geocodificar(endereco: string): Promise<{ latitude: number; longitude: number }> {
  try {
    const consulta = [endereco, "Ji-Paraná", "Rondônia", "Brasil"].join(", ");
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(consulta)}`;

    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 4000);

    const resposta = await fetch(url, {
      headers: { "User-Agent": "CidadeConecta-TCC/1.0 (IFRO Ji-Parana)" },
      signal: controlador.signal,
    });
    clearTimeout(limite);

    const dados = (await resposta.json()) as { lat: string; lon: string }[];

    if (dados.length > 0) {
      return { latitude: Number(dados[0].lat), longitude: Number(dados[0].lon) };
    }
  } catch {
    // segue para o valor aproximado
  }

  return {
    latitude: CENTRO.latitude + (Math.random() - 0.5) * 0.03,
    longitude: CENTRO.longitude + (Math.random() - 0.5) * 0.03,
  };
}
