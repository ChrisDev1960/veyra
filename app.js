const SUPABASE_URL = "https://kwjfqevarxogvammijeo.supabase.co/rest/v1/profiles
";
const SUPABASE_ANON_KEY = "sb_publishable_OsKDW7bcZeR47RTTRIHehQ_cVhut_2J
";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
const balance = document.getElementById("balance");
const balanceToggle = document.getElementById("balanceToggle");

let balanceVisible = true;

balanceToggle.addEventListener("click", () => {
  balanceVisible = !balanceVisible;

  balance.textContent = balanceVisible
    ? "₦128,400"
    : "••••••••";

  if (navigator.vibrate) {
    navigator.vibrate(8);
  }
});

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    if (navigator.vibrate) {
      navigator.vibrate(6);
    }
  });
});
