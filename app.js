const SUPABASE_URL = "https://kwjfqevarxogvammijeo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OsKDW7bcZeR47RTTRIHehQ_cVhut_2J";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const byId = (id) => document.getElementById(id);
const appElement = document.querySelector(".app");

function showMessage(element, message, success = false) {
  if (!element) return;
  element.textContent = message;
  element.style.display = "block";
  element.classList.toggle("success", success);
}

// ==============================
// BALANCE VISIBILITY
// ==============================
const balance = byId("balance");
const balanceToggle = byId("balanceToggle");
let balanceVisible = true;

if (balanceToggle && balance) {
  balanceToggle.addEventListener("click", () => {
    balanceVisible = !balanceVisible;
    balance.textContent = balanceVisible ? "₦128,400" : "••••••••";
    if (navigator.vibrate) navigator.vibrate(8);
  });
}

// ==============================
// BUTTON VIBRATION
// ==============================
document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    if (navigator.vibrate) navigator.vibrate(6);
  });
});

// ==============================
// REGISTRATION + USERNAME CHECK
// ==============================
const registerForm = byId("registerForm");
const registerMessage = byId("registerMessage");
const usernameInput = byId("username");
let usernameCheckTimer;
let usernameStatus = null;

if (usernameInput && usernameInput.parentNode) {
  usernameStatus = document.createElement("small");
  usernameStatus.style.display = "none";
  usernameStatus.style.marginTop = "7px";
  usernameStatus.style.fontSize = "12px";
  usernameInput.parentNode.appendChild(usernameStatus);

  usernameInput.addEventListener("input", () => {
    clearTimeout(usernameCheckTimer);

    const username = usernameInput.value.trim();
    usernameStatus.style.display = "none";
    usernameStatus.textContent = "";

    if (!username) return;

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
      const { data, error } = await supabaseClient.rpc(
        "check_username_available",
        { p_username: username }
      );

      if (usernameInput.value.trim() !== username) return;

      if (error) {
        usernameStatus.textContent =
          "Unable to check username right now.";
        usernameStatus.style.color = "#dc2626";
        return;
      }

      usernameStatus.textContent = data
        ? "Wonderful! Username is available."
        : "This username already exists. Please choose another.";

      usernameStatus.style.color = data ? "#10b981" : "#dc2626";
    }, 500);
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = byId("firstName")?.value.trim() || "";
    const lastName = byId("lastName")?.value.trim() || "";
    const username = byId("username")?.value.trim() || "";
    const email = byId("email")?.value.trim() || "";
    const password = byId("password")?.value || "";
    const confirmPassword = byId("confirmPassword")?.value || "";
    const termsAccepted = Boolean(byId("terms")?.checked);
    const submitButton = registerForm.querySelector(".auth-submit");

    if (registerMessage) {
      registerMessage.style.display = "none";
      registerMessage.textContent = "";
      registerMessage.classList.remove("success");
    }

    if (!firstName || !lastName || !username || !email) {
      showMessage(registerMessage, "Please complete all required fields.");
      return;
    }

    if (!/^[A-Za-z0-9]{4,20}$/.test(username)) {
      showMessage(
        registerMessage,
        "Username must be 4–20 characters and contain only letters and numbers."
      );
      return;
    }

    if (password.length < 8) {
      showMessage(registerMessage, "Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      showMessage(
        registerMessage,
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      showMessage(
        registerMessage,
        "Password must contain at least one number."
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(registerMessage, "Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      showMessage(
        registerMessage,
        "You must agree to the Terms and confirm that you are at least 16."
      );
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";
    }

    try {
      const {
        data: usernameAvailable,
        error: usernameError
      } = await supabaseClient.rpc("check_username_available", {
        p_username: username
      });

      if (usernameError) {
        showMessage(
          registerMessage,
          "We couldn't verify the username right now. Please try again."
        );
        return;
      }

      if (!usernameAvailable) {
        showMessage(
          registerMessage,
          "This username already exists. Please choose another."
        );
        return;
      }

      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username
          }
        }
      });

      if (error) throw error;

      showMessage(
        registerMessage,
        "Account created successfully. Please check your email to verify your account.",
        true
      );

      registerForm.reset();

      if (usernameStatus) {
        usernameStatus.textContent = "";
        usernameStatus.style.display = "none";
      }
    } catch (error) {
      const message = error?.message || "Something went wrong. Please try again.";

      if (
        error?.code === "23505" ||
        message.toLowerCase().includes("username")
      ) {
        showMessage(
          registerMessage,
          "This username already exists. Please choose another."
        );
      } else {
        showMessage(registerMessage, message);
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Create account";
      }
    }
  });
}

// ==============================
// AUTH SCREEN SWITCHING
// ==============================
const registerScreen = byId("registerScreen");
const loginScreen = byId("loginScreen");
const resetPasswordScreen = byId("resetPasswordScreen");
const showLoginButton = byId("showLoginButton");
const showRegisterButton = byId("showRegisterButton");

if (showLoginButton) {
  showLoginButton.addEventListener("click", () => {
    if (registerScreen) registerScreen.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
  });
}

if (showRegisterButton) {
  showRegisterButton.addEventListener("click", () => {
    if (loginScreen) loginScreen.style.display = "none";
    if (registerScreen) registerScreen.style.display = "flex";
  });
}

// ==============================
// LOGIN
// ==============================
const loginForm = byId("loginForm");
const loginMessage = byId("loginMessage");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = byId("loginEmail")?.value.trim() || "";
    const password = byId("loginPassword")?.value || "";
    const loginButton = loginForm.querySelector(".auth-submit");

    if (loginMessage) {
      loginMessage.style.display = "none";
      loginMessage.textContent = "";
    }

    if (loginButton) {
      loginButton.disabled = true;
      loginButton.textContent = "Logging in...";
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showMessage(loginMessage, "Incorrect email or password. Please try again.");
        return;
      }

      if (loginScreen) loginScreen.style.display = "none";
      if (registerScreen) registerScreen.style.display = "none";
      if (appElement) appElement.style.display = "block";

      showHomeSection();
      updateUserHeader();
    } catch (error) {
      showMessage(
        loginMessage,
        error?.message || "Unable to log in. Please try again."
      );
    } finally {
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent = "Log in";
      }
    }
  });
}

// ==============================
// PASSWORD RESET
// ==============================
const resetPasswordForm = byId("resetPasswordForm");
const resetPasswordMessage = byId("resetPasswordMessage");
const forgotPasswordButton = byId("forgotPasswordButton");

if (forgotPasswordButton) {
  forgotPasswordButton.addEventListener("click", async () => {
    const email = byId("loginEmail")?.value.trim() || "";

    if (!email) {
      showMessage(loginMessage, "Please enter your email address first.");
      return;
    }

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: "https://chrisdev1960.github.io/veyra/"
        }
      );

      if (error) throw error;

      showMessage(
        loginMessage,
        "Password reset link sent. Please check your email."
      );
    } catch (error) {
      console.error("Password reset error:", error);

      showMessage(
        loginMessage,
        error?.message || "Unable to send password reset email. Please try again."
      );
    }
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = byId("newPassword")?.value || "";
    const confirmNewPassword = byId("confirmNewPassword")?.value || "";

    if (resetPasswordMessage) {
      resetPasswordMessage.style.display = "none";
      resetPasswordMessage.textContent = "";
    }

    if (newPassword.length < 8) {
      showMessage(
        resetPasswordMessage,
        "Password must be at least 8 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      showMessage(
        resetPasswordMessage,
        "Password must contain at least 1 uppercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      showMessage(
        resetPasswordMessage,
        "Password must contain at least 1 number."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showMessage(resetPasswordMessage, "Passwords do not match.");
      return;
    }

    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showMessage(
        resetPasswordMessage,
        "Password updated successfully. You can now log in.",
        true
      );

      resetPasswordForm.reset();
    } catch (error) {
      console.error("Password update error:", error);

      showMessage(
        resetPasswordMessage,
        error?.message || "Unable to update password. Please try again."
      );
    }
  });
}

// ==============================
// SESSION + PASSWORD RECOVERY
// ==============================
function showPasswordRecovery() {
  if (registerScreen) registerScreen.style.display = "none";
  if (loginScreen) loginScreen.style.display = "none";
  if (appElement) appElement.style.display = "none";
  if (resetPasswordScreen) resetPasswordScreen.style.display = "flex";
}

supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    showPasswordRecovery();
  }
});

supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Session check error:", error);
    return;
  }

  if (window.location.hash.includes("type=recovery")) return;

  if (data.session) {
    if (registerScreen) registerScreen.style.display = "none";
    if (loginScreen) loginScreen.style.display = "none";
    if (appElement) appElement.style.display = "block";
  } else {
    if (registerScreen) registerScreen.style.display = "flex";
    if (loginScreen) loginScreen.style.display = "none";
    if (appElement) appElement.style.display = "none";
  }
});

// ==============================
// LOGOUT
// ==============================
const logoutButton = byId("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert("Unable to log out. Please try again.");
      return;
    }

    if (appElement) appElement.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
    if (registerScreen) registerScreen.style.display = "none";
  });
}

// ==============================
// GREETING + USER INITIALS
// ==============================
const userGreeting = byId("userGreeting");
const userInitials = byId("userInitials");

async function updateUserHeader() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) return;

  const firstName = data.user.user_metadata?.first_name || "";
  const lastName = data.user.user_metadata?.last_name || "";

  if (firstName && userGreeting) {
    const hour = new Date().getHours();

    let greeting = "Good evening";

    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 18) {
      greeting = "Good afternoon";
    }

    userGreeting.textContent = `${greeting}, ${firstName}`;
  }

  if ((firstName || lastName) && userInitials) {
    userInitials.textContent =
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}

updateUserHeader();

// ==============================
// HOME / PROFILE / WALLET / ADD MONEY NAVIGATION
// ==============================
const homeNavButton = byId("homeNavButton");
const profileNavButton = byId("profileNavButton");
const walletNavButton = byId("walletNavButton");

const profileSection = byId("profileSection");
const walletSection = byId("walletSection");
const addMoneySection = byId("addMoneySection");

const walletAddMoneyButton = byId("walletAddMoneyButton");
const homeAddMoneyButton = document.querySelector(
  ".balance-actions .primary-button"
);

const navItems = document.querySelectorAll(".bottom-nav .nav-item");

function setActiveNav(button) {
  navItems.forEach((item) => item.classList.remove("active"));

  if (button) {
    button.classList.add("active");
  }
}

function hideMainSections() {
  document.querySelectorAll("main > section").forEach((section) => {
    section.style.display = "none";
  });
}

function showHomeSection() {
  hideMainSections();

  document.querySelectorAll("main > section").forEach((section) => {
    if (
      ![
        "profileSection",
        "walletSection",
        "addMoneySection"
      ].includes(section.id)
    ) {
      section.style.display = "";
    }
  });

  setActiveNav(homeNavButton);
}

function showWalletSection() {
  hideMainSections();

  if (walletSection) {
    walletSection.style.display = "block";
  }

  setActiveNav(walletNavButton);
}

function openAddMoney() {
  if (!addMoneySection) {
    console.error(
      'Veyra: Could not find the HTML section with id="addMoneySection".'
    );
    return;
  }

  hideMainSections();
  addMoneySection.style.display = "block";

  // Keep Wallet highlighted while viewing Add Money.
  setActiveNav(walletNavButton);

  addMoneySection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

if (homeNavButton) {
  homeNavButton.addEventListener("click", showHomeSection);
}

if (walletNavButton) {
  walletNavButton.addEventListener("click", showWalletSection);
}

if (walletAddMoneyButton) {
  walletAddMoneyButton.addEventListener("click", openAddMoney);
}

if (homeAddMoneyButton) {
  homeAddMoneyButton.addEventListener("click", openAddMoney);
}

if (profileNavButton && profileSection) {
  profileNavButton.addEventListener("click", async () => {
    hideMainSections();
    profileSection.style.display = "block";
    setActiveNav(profileNavButton);

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) return;

    const firstName = data.user.user_metadata?.first_name || "";
    const lastName = data.user.user_metadata?.last_name || "";
    const email = data.user.email || "";

    const profileName = byId("profileName");
    const profileEmail = byId("profileEmail");
    const profileAvatar = byId("profileAvatar");

    if (profileName) {
      profileName.textContent = `${firstName} ${lastName}`.trim();
    }

    if (profileEmail) {
      profileEmail.textContent = email;
    }

    if (profileAvatar) {
      profileAvatar.textContent =
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "--";
    }
  });
}

// Add a Back to Wallet button to the Add Money screen.
if (addMoneySection && !byId("backToWalletButton")) {
  const backButton = document.createElement("button");

  backButton.id = "backToWalletButton";
  backButton.type = "button";
  backButton.className = "secondary-button";
  backButton.textContent = "← Back to Wallet";
  backButton.style.marginBottom = "16px";

  backButton.addEventListener("click", showWalletSection);

  addMoneySection.insertBefore(backButton, addMoneySection.firstChild);
}
