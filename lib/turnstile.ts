interface TurnstileVerificationResult {
  success: boolean;
  hostname?: string;
  "error-codes"?: string[];
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("服务端未配置 TURNSTILE_SECRET_KEY");
  }

  const payload = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    throw new Error("人机验证服务暂时不可用，请稍后再试");
  }

  return (await response.json()) as TurnstileVerificationResult;
}
