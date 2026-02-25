// Se estiver usando Node 18+, pode usar fetch nativo sem instalar node-fetch
// Caso contrário, mantenha o node-fetch instalado
const fetch = require("node-fetch");

// Função para gerar checkout (ordem de pagamento)
async function gerarCheckout(descricao, valor, referenceId) {
  try {
    const orderData = {
      reference_id: referenceId, // ID do canal do ticket
      customer: {
        name: "Cliente Teste",
        email: "cliente@teste.com" // pode ser substituído pelo email real do usuário
      },
      items: [
        {
          name: descricao,
          quantity: 1,
          unit_amount: Math.round(valor * 100) // valor em centavos
        }
      ]
    };

    // Use sandbox para testes. Troque para https://api.pagseguro.com/orders em produção
    const response = await fetch("https://sandbox.api.pagseguro.com/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`, // token da aplicação
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao criar ordem: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Retorna o link de pagamento
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
