import api from "./api";

export const getPayments = async (
  params = {}
) => {
  const response =
    await api.get(
      "/payments",
      {
        params,
      }
    );

  return response.data;
};

export const getPaymentById =
  async (
    paymentId
  ) => {
    const response =
      await api.get(
        `/payments/${paymentId}`
      );

    return response.data;
  };

export const getInvoicePayments =
  async (
    invoiceId
  ) => {
    const response =
      await api.get(
        `/payments/invoice/${invoiceId}`
      );

    return response.data;
  };

export const createPayment =
  async ({
    invoiceId,
    payload,
  }) => {
    const response =
      await api.post(
        `/payments/invoice/${invoiceId}`,
        payload
      );

    return response.data;
  };

export const updatePayment =
  async ({
    paymentId,
    payload,
  }) => {
    const response =
      await api.patch(
        `/payments/${paymentId}`,
        payload
      );

    return response.data;
  };

export const reversePayment =
  async ({
    paymentId,
    reversalReason,
  }) => {
    const response =
      await api.post(
        `/payments/${paymentId}/reverse`,
        {
          reversalReason,
        }
      );

    return response.data;
  };