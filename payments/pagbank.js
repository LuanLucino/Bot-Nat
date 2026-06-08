const PAGBANK_ENV = process.env.PAGBANK_ENV || "sandbox";

const ENDPOINTS = {
  sandbox: "https://sandbox.api.pagseguro.com/checkouts",
  production: "https://api.pagseguro.com/checkouts"
};

async function gerarCheckout(descricao, valor, referenceId) {
  try {
    const notificationUrls = process.env.WEBHOOK_URL
      ? [`${process.env.WEBHOOK_URL}/pagbank-webhook`]
      : [];

    const body = {
      reference_id: referenceId,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          name: descricao,
          quantity: 1,
          unit_amount: Math.round(valor * 100)
        }
      ],
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "PIX" }
      ]
    };

    if (notificationUrls.length > 0) {
      body.notification_urls = notificationUrls;
    }

    const response = await fetch(ENDPOINTS[PAGBANK_ENV], {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAGBANK_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro PagBank:", JSON.stringify(data, null, 2));
      return {
        erro: true,
        mensagem: data.error_messages?.[0]?.description || data.message || "Erro desconhecido"
      };
    }

    const payLink = data.links?.find(link => link.rel === "PAY");
    if (payLink) {
      return { erro: false, url: payLink.href };
    }

    console.error("Resposta PagBank sem link PAY:", JSON.stringify(data, null, 2));
    return { erro: true, mensagem: "Nenhum link de pagamento retornado pela API." };
  } catch (error) {
    console.error("Erro na integração com PagBank:", error);
    return { erro: true, mensagem: "Falha na integração com PagBank." };
  }
}

module.exports = { gerarCheckout };
