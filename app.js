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
const usernameInput = document.getElementById("username");

const usernameStatus = document.createElement("small");
usernameStatus.style.display = "none";
usernameStatus.style.marginTop = "7px";
usernameStatus.style.fontSize = "12px";

usernameInput.parentNode.appendChild(usernameStatus);

let usernameCheckTimer;

usernameInput.addEventListener("input", () => {
  clearTimeout(usernameCheckTimer);

  const username = usernameInput.value.trim();

  usernameStatus.style.display = "none";
  usernameStatus.textContent = "";

  if (!username) {
    return;
  }

  if (!/^[A-Za-z0-9]{4,20}$/.test(username)) {
    usernameStatus.textContent =
      "Username must be 4–20 characters and contain only letters and numbers.";
    usernameStatus.style.color = "#dc2626";
    usernameStatus.style.display = "block";
    return;
  }

  usernameStatus.textContent = "Checking username...";
  usernameStatus.style.color = "#6b7280";
  usernameStatus.style.display = "block";

  usernameCheckTimer = setTimeout(async () => {
    const { data, error } = await supabaseClient
      .rpc("check_username_available", {
        p_username: username
      });

    if (error) {
      usernameStatus.textContent =
        "Unable to check username right now.";
      usernameStatus.style.color = "#dc2626";
      return;
    }

    if (!data) {
      usernameStatus.textContent =
        "This username already exists. Please choose another.";
      usernameStatus.style.color = "#dc2626";
    } else {
      usernameStatus.textContent =
        "Wonderful! Username is available.";
      usernameStatus.style.color = "#10b981";
    }
  }, 500);
});

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

  const { data: usernameAvailable, error: usernameError } =
  await supabaseClient.rpc("check_username_available", {
    p_username: username
  });

if (usernameError) {
  registerMessage.textContent =
    "We couldn't verify the username right now. Please try again.";
  registerMessage.style.display = "block";
  return;
}

if (!usernameAvailable) {
  registerMessage.textContent =
    "This username already exists. Please choose another.";
  registerMessage.style.display = "block";
  return;
}

if (existingUsername && existingUsername.length > 0) {
  registerMessage.textContent =
    "This username already exists. Please choose another.";
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
  "Account created successfully. Please check your email to verify your account.";

  registerMessage.classList.add("success");
  registerMessage.style.display = "block";

    registerForm.reset();

 } catch (error) {
  if (
    error.code === "23505" ||
    error.message?.toLowerCase().includes("username")
  ) {
    registerMessage.textContent =
      "This username already exists. Please choose another.";
  } else {
    registerMessage.textContent =
      error.message || "Something went wrong. Please try again.";
  }

  registerMessage.classList.remove("success");
  registerMessage.style.display = "block";
}
});

const registerScreen = document.getElementById("registerScreen");
const loginScreen = document.getElementById("loginScreen");

const showLoginButton = document.getElementById("showLoginButton");
const showRegisterButton = document.getElementById("showRegisterButton");

showLoginButton.addEventListener("click", () => {
  registerScreen.style.display = "none";
  loginScreen.style.display = "flex";
});

showRegisterButton.addEventListener("click", () => {
  loginScreen.style.display = "none";
  registerScreen.style.display = "flex";
});

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  loginMessage.style.display = "none";
  loginMessage.textContent = "";

  const loginButton = loginForm.querySelector(".auth-submit");
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    loginMessage.textContent =
      "Incorrect email or password. Please try again.";
    loginMessage.style.display = "block";

    loginButton.disabled = false;
    loginButton.textContent = "Log in";
   return;
  }

  loginButton.disabled = false;
  loginButton.textContent = "Log in";

  loginScreen.style.display = "none";
  document.querySelector(".app").style.display = "block";
});

const resetPasswordScreen = document.getElementById("resetPasswordScreen");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetPasswordMessage = document.getElementById("resetPasswordMessage");

supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    registerScreen.style.display = "none";
    loginScreen.style.display = "none";
    document.querySelector(".app").style.display = "none";
    resetPasswordScreen.style.display = "flex";
  }
});

supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) {
    registerScreen.style.display = "none";
    loginScreen.style.display = "none";
    document.querySelector(".app").style.display = "block";
  } else {
    registerScreen.style.display = "flex";
    loginScreen.style.display = "none";
    document.querySelector(".app").style.display = "none";
  }
});
const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Unable to log out. Please try again.");
    return;
  }

  document.querySelector(".app").style.display = "none";
  loginScreen.style.display = "flex";
  registerScreen.style.display = "none";
});

const forgotPasswordButton = document.getElementById("forgotPasswordButton");

forgotPasswordButton.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();

  if (!email) {
    loginMessage.textContent = "Please enter your email address first.";
    loginMessage.style.display = "block";
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://chrisdev1960.github.io/veyra/"
  });

  if (error) {
    console.error("Password reset error:", error);

    loginMessage.textContent =
      error.message || "Unable to send password reset email. Please try again.";

    loginMessage.style.display = "block";
    return;
  }

  loginMessage.textContent =
    "Password reset link sent. Please check your email.";
  loginMessage.style.display = "block";
});

supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    registerScreen.style.display = "none";
    loginScreen.style.display = "none";
    document.querySelector(".app").style.display = "none";
    resetPasswordScreen.style.display = "flex";
  }
});

resetPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;

  resetPasswordMessage.style.display = "none";
  resetPasswordMessage.textContent = "";

  if (newPassword.length < 8) {
    resetPasswordMessage.textContent =
      "Password must be at least 8 characters.";
    resetPasswordMessage.style.display = "block";
    return;
  }

  if (!/[A-Z]/.test(newPassword)) {
    resetPasswordMessage.textContent =
      "Password must contain at least 1 uppercase letter.";
    resetPasswordMessage.style.display = "block";
    return;
  }

  if (!/[0-9]/.test(newPassword)) {
    resetPasswordMessage.textContent =
      "Password must contain at least 1 number.";
    resetPasswordMessage.style.display = "block";
    return;
  }

  if (newPassword !== confirmNewPassword) {
    resetPasswordMessage.textContent =
      "Passwords do not match.";
    resetPasswordMessage.style.display = "block";
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error("Password update error:", error);

    resetPasswordMessage.textContent =
      error.message || "Unable to update password. Please try again.";
    resetPasswordMessage.style.display = "block";
    return;
  }

  resetPasswordMessage.textContent =
    "Password updated successfully. You can now log in.";
  resetPasswordMessage.style.display = "block";

  resetPasswordForm.reset();
});

const userGreeting = document.getElementById("userGreeting");
const userInitials = document.getElementById("userInitials");

supabaseClient.auth.getUser().then(({ data, error }) => {
  if (error || !data.user) {
    return;
  }

  const firstName = data.user.user_metadata?.first_name;
  const lastName = data.user.user_metadata?.last_name;

  if (firstName) {
    const hour = new Date().getHours();

    let greeting = "Good evening";

    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 18) {
      greeting = "Good afternoon";
    }

    userGreeting.textContent = `${greeting}, ${firstName}`;
  }

  if (firstName || lastName) {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";

    userInitials.textContent = `${firstInitial}${lastInitial}`;
  }
});
