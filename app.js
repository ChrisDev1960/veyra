const SUPABASE_URL = "https://kwjfqevarxogvammijeo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OsKDW7bcZeR47RTTRIHehQ_cVhut_2J";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ==============================
// BALANCE VISIBILITY
// ==============================

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


// ==============================
// BUTTON VIBRATION
// ==============================

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    if (navigator.vibrate) {
      navigator.vibrate(6);
    }
  });
});
```
