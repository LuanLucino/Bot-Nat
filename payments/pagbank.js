const fetch = require("node-fetch");

// Função para gerar checkout (ordem de pagamento)
async function gerarCheckout(descricao, valor, referenceId) {
  try {
    const orderData = {
      reference_id: referenceId, // ID do canal do ticket
      items: [
        {
          name: descricao,
          quantity: 1,
          unit_amount: Math.round(valor * 100) // valor em centavos
        }
      ]
    };

    const response = await fetch("https://api.pagseguro.com/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`, // token da aplicação
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar ordem: ${response.statusText}`);
    }

    const data = await response.json();

    // Retorna o link de pagamento
    return data.links[0].href;
  } catch (error) {
    console.error("Erro na integração com PagBank:", error);
    throw error;
  }
}

module.exports = {
  gerarCheckout
};
