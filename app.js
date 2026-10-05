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
