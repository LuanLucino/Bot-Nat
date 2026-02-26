const fetch = require("node-fetch");

async function gerarCheckout(descricao, valor, referenceId) {
  try {
    const orderData = {
      reference_id: referenceId, // ID do canal do ticket
      customer: {
        name: "Cliente",
        email: "cliente@teste.com" // substitua se quiser capturar email real
      },
      items: [
        {
          name: descricao,
          quantity: 1,
          unit_amount: Math.round(valor * 100) // valor em centavos
        }
      ]
    };

    // Endpoint de PRODUÇÃO
    const response = await fetch("https://api.pagseguro.com/orders", {
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
      throw new Error(`Erro ao criar ordem: ${response.status} - ${JSON.stringify(data)}`);
    }

    if (data.links && data.links.length > 0) {
      return data.links[0].href;
    } else {
      throw new Error("Nenhum link de pagamento retornado pela API.");
    }
  } catch (error) {
    console.error("Erro na integração com PagBank:", error);
    throw error;
  }
}

module.exports = {
  gerarCheckout
};
