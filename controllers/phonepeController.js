import crypto from "crypto";
import axios from "axios";

// const merchantId = process.env.PHONEPE_MERCHANT_ID;
// const saltKey = process.env.PHONEPE_SALT_KEY;
// const saltIndex = process.env.PHONEPE_SALT_INDEX;

const merchantId = 'TEST-M233ITW27QX8H_25060';
const saltKey = 'NDBhNGQ3OTAtMDY1Ni00ZDVjLWJiMDQtZGY1MGRkZWRjYmZl';
const saltIndex = 1;
const baseUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";

const initiatePayment = async (req, res) => {
  const transactionId = `TXN_${Date.now()}`;
  const payload = {
    merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: "USER123",
    amount: 10000, // ₹100 in paise
    redirectUrl: "https://pkphotography.in/payment-success",
    redirectMode: "POST",
    callbackUrl: "https://pkphotography.in/api/phonepe/callback",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const data = JSON.stringify(payload);
  const base64Data = Buffer.from(data).toString("base64");
  const xVerify = crypto.createHash("sha256").update(base64Data + "/pg/v1/pay" + saltKey).digest("hex") + `###${saltIndex}`;

  try {
    const response = await axios.post(
      `${baseUrl}/pg/v1/pay`,
      { request: base64Data },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );
    res.json({ redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
    console.error("PhonePe init error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

const paymentCallback = async (req, res) => {
  // Validate or store callback data here
  res.status(200).send("OK");
};

const checkStatus = async (req, res) => {
  const { transactionId } = req.params;
  const url = `/pg/v1/status/${merchantId}/${transactionId}`;
  const xVerify = crypto.createHash("sha256").update(url + saltKey).digest("hex") + `###${saltIndex}`;

  try {
    const response = await axios.get(`${baseUrl}${url}`, {
      headers: { "X-VERIFY": xVerify },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Status check error:", error.message);
    res.status(500).json({ error: "Failed to fetch status" });
  }
};

export { initiatePayment, paymentCallback, checkStatus };