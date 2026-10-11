const sk = "sk_test_ClQaaKipquu8o7j8hDUZ7vyEO1a84kn1K4v6Bomg9O";

async function updatePassword(userId, email) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${sk}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: "Uncomm0n@26",
      skip_password_checks: true,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ ${email}: Password successfully updated to Uncomm0n@26 (User ID: ${data.id})`);
  } else {
    console.error(`❌ ${email} error:`, JSON.stringify(data.errors));
  }
}

async function run() {
  await updatePassword("user_3JdfJpXl3jwc3Fji81sWDC641mC", "simbarashe@uncommon.org");
  await updatePassword("user_3KSQ6cWyT3fPzvBr9YytChKBap2", "anesu.muchirewesi@uncommon.org");
  await updatePassword("user_3KSQ6YzPAT9yk9IBMAvk0xeETFB", "diana@uncommon.org");
}

run();
