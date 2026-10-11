const CLERK_SECRET_KEY =
  process.env.CLERK_SECRET_KEY || "sk_test_ClQaaKipquu8o7j8hDUZ7vyEO1a84kn1K4v6Bomg9O";

export async function createSignInTicket(
  email: string,
  password?: string
): Promise<{ token: string; userId: string }> {
  const trimmedEmail = email.trim().toLowerCase();

  // 1. Query user by email from Clerk Backend API
  const userRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(trimmedEmail)}`,
    {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    }
  );

  if (!userRes.ok) {
    throw new Error(`Failed to lookup Clerk user (HTTP ${userRes.status})`);
  }

  const users = await userRes.json();
  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new Error(`No user found with email: ${trimmedEmail}`);
  }

  const user = users[0];

  // 2. If password provided, verify password with Clerk
  if (password) {
    const verifyRes = await fetch(
      `https://api.clerk.com/v1/users/${user.id}/verify_password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    if (!verifyRes.ok) {
      throw new Error("Invalid email or password");
    }

    const verifyData = await verifyRes.json();
    if (!verifyData.verified) {
      throw new Error("Invalid email or password");
    }
  }

  // 3. Issue single-use sign-in ticket token
  const tokenRes = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.id,
      expires_in_seconds: 300,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(
      err?.errors?.[0]?.message || "Could not generate authentication ticket"
    );
  }

  const tokenData = await tokenRes.json();
  return { token: tokenData.token, userId: user.id };
}
