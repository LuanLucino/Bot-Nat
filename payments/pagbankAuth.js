async function gerarAccessToken() {
  const response = await fetch("https://api.pagseguro.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.PAGBANK_CLIENT_ID,
      client_secret: process.env.PAGBANK_CLIENT_SECRET
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro ao gerar access_token:", data);
    throw new Error(`Erro ao gerar access_token: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

module.exports = { gerarAccessToken };
