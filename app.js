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

// ==============================
// REGISTRATION
// ==============================

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const termsAccepted = document.getElementById("terms").checked;
  const submitButton = registerForm.querySelector(".auth-submit");

  registerMessage.style.display = "none";
  registerMessage.textContent = "";

  if (!firstName || !lastName || !username || !email) {
    registerMessage.textContent = "Please complete all required fields.";
    registerMessage.style.display = "block";
    return;
  }

  if (password.length < 8) {
    registerMessage.textContent =
      "Password must be at least 8 characters.";
    registerMessage.style.display = "block";
    return;
  }

  if (!/[A-Z]/.test(password)) {
    registerMessage.textContent =
      "Password must contain at least one uppercase letter.";
    registerMessage.style.display = "block";
    return;
  }

  if (!/[0-9]/.test(password)) {
    registerMessage.textContent =
      "Password must contain at least one number.";
    registerMessage.style.display = "block";
    return;
  }

  if (password !== confirmPassword) {
    registerMessage.textContent = "Passwords do not match.";
    registerMessage.style.display = "block";
    return;
  }

  if (!termsAccepted) {
    registerMessage.textContent =
      "You must agree to the Terms and confirm that you are at least 16.";
    registerMessage.style.display = "block";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Creating account...";

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username
        }
      }
    });

    if (error) {
      throw error;
    }

    registerMessage.textContent =
      "Account created. Please check your email to verify your account.";
    registerMessage.style.display = "block";

    registerForm.reset();

  } catch (error) {
    registerMessage.textContent =
      error.message || "Something went wrong. Please try again.";
    registerMessage.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create account";
  }
});
