process.loadEnvFile(".env");

type SendOtpSmsInput = {
  mobile: string;
  otp: string;
  minutes: number;
};

function formatIndianMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");

  if (/^[6-9]\d{9}$/.test(digits)) {
    return `91${digits}`;
  }

  if (/^91[6-9]\d{9}$/.test(digits)) {
    return digits;
  }

  throw new Error("Mobile must be a valid 10-digit Indian mobile number");
}

export async function sendOtpSms({ mobile, otp, minutes }: SendOtpSmsInput) {
  const authKey = process.env.MSG91_AUTH_KEY?.trim();
  const templateId = process.env.MSG91_TEMPLATE_ID?.trim();

  if (!authKey || !templateId) {
    throw new Error(
      "MSG91_AUTH_KEY and MSG91_TEMPLATE_ID environment variables are required",
    );
  }

  const response = await fetch("https://control.msg91.com/api/v5/flow", {
    method: "POST",
    headers: {
      accept: "application/json",
      authkey: authKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      short_url: "0",
      recipients: [
        {
          mobiles: formatIndianMobile(mobile),
          // These names exactly match ##otp## and ##minutes## in MSG91.
          otp,
          minutes: String(minutes),
        },
      ],
    }),
  });

  const responseText = await response.text();
  let result: unknown = responseText;

  try {
    result = JSON.parse(responseText);
  } catch {
    // Preserve non-JSON responses so an MSG91 error remains visible.
  }

  if (!response.ok) {
    throw new Error(
      `MSG91 request failed (${response.status}): ${JSON.stringify(result)}`,
    );
  }

  return result;
}

const phoneNumber = process.env.PHONE?.trim();
if (!phoneNumber) {
  throw new Error("PHONE environment variable is required");
}

await sendOtpSms({
  mobile: phoneNumber,
  otp: "123456",
  minutes: 5,
});
