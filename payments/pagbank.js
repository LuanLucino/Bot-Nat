const fetch = require("node-fetch");

// Define se vamos usar sandbox ou produção
const PAGBANK_ENV = process.env.PAGBANK_ENV || "sandbox"; 
// valores possíveis: "sandbox" ou "production"

const ENDPOINTS = {
  sandbox: "https://sandbox.api.pagseguro.com/orders",
  production: "https://api.pagseguro.com/orders"
};

async function gerarCheckout(descricao, valor, referenceId) {
  try {
    const orderData = {
      reference_id: referenceId,
      customer: {
        name: "Cliente Teste",
        email: "cliente@teste.com",
        tax_id: "12345678909"
      },
      items: [
        {
          name: descricao,
          quantity: 1,
          unit_amount: Math.round(valor * 100)
        }
      ]
    };

    const response = await fetch(ENDPOINTS[PAGBANK_ENV], {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro PagBank:", data);
      return { erro: true, mensagem: data.error_messages?.[0]?.description || "Erro desconhecido" };
    }

    if (data.links && data.links.length > 0) {
      return { erro: false, url: data.links[0].href };
    } else {
      return { erro: true, mensagem: "Nenhum link de pagamento retornado pela API." };
    }
  } catch (error) {
    console.error("Erro na integração com PagBank:", error);
    return { erro: true, mensagem: "Falha na integração com PagBank." };
  }
}

module.exports = { gerarCheckout };
