const mercadopago = require('mercadopago');

// Configure com seu token de acesso do Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// Função para gerar checkout
async function gerarCheckout(titulo, preco, quantidade = 1) {
  const preference = {
    items: [
      {
        title: titulo,
        quantity: quantidade,
        currency_id: 'BRL',
        unit_price: preco
      }
    ]
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    return response.body.init_point; // Link de pagamento
  } catch (error) {
    console.error("Erro ao gerar checkout:", error);
    throw error;
  }
}

module.exports = { gerarCheckout };
