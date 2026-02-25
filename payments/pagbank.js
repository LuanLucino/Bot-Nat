const fetch = require("node-fetch");

// Função para criar uma ordem de pagamento no PagBank
async function criarOrdemPagamento(orderData) {
  try {
    const response = await fetch("https://api.pagseguro.com/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`, // Token da aplicação
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar ordem: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Retorna os dados da ordem (inclui link de pagamento)
  } catch (error) {
    console.error("Erro na integração com PagBank:", error);
    throw error;
  }
}

// Função para consultar status de uma ordem
async function consultarOrdem(orderId) {
  try {
    const response = await fetch(`https://api.pagseguro.com/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar ordem: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Retorna status da ordem
  } catch (error) {
    console.error("Erro ao consultar ordem:", error);
    throw error;
  }
}

module.exports = {
  criarOrdemPagamento,
  consultarOrdem
};
