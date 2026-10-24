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



// ==============================
// MANUAL DEPOSIT SUBMISSION
// ==============================
const depositForm = document.getElementById("depositForm");

if (depositForm) {
  depositForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("depositMessage");
    const submitButton = depositForm.querySelector('button[type="submit"]');
    const amountInput = document.getElementById("depositAmount");
    const proofInput = document.getElementById("depositProof");

    const amount = Number(amountInput.value);
    const file = proofInput.files?.[0];

    const showDepositMessage = (text) => {
      if (!message) return;
      message.textContent = text;
      message.style.display = "block";
      message.style.color = "#dc2626";
    };

    if (!Number.isFinite(amount) || amount < 1200) {
      showDepositMessage("Minimum deposit is ₦1,200.");
      return;
    }

    if (!file) {
      showDepositMessage("Please upload your transfer receipt.");
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)
    ) {
      showDepositMessage("Upload a JPG, PNG, WEBP, or PDF receipt.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showDepositMessage("Receipt must be 5 MB or smaller.");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("Please log in again before submitting.");
      }

      const userId = userData.user.id;
      const extension = file.name.split(".").pop().toLowerCase();
      const proofPath =
        `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("deposit-proofs")
        .upload(proofPath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { error: requestError } = await supabaseClient
        .from("deposit_requests")
        .insert({
          user_id: userId,
          amount,
          proof_path: proofPath
        });

      if (requestError) throw requestError;

      // Show the confirmation screen only after successful submission.
      depositForm.reset();

      document.getElementById("addMoneySection").style.display = "none";

      const successSection =
        document.getElementById("depositSuccessSection");

      if (!successSection) {
        throw new Error("Confirmation screen not found. Please refresh and try again.");
      }

      successSection.style.display = "block";
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Deposit submission error:", error);
      showDepositMessage(
        error.message || "Could not submit your deposit. Please try again."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit deposit for approval";
      }
    }
  });
}

// ==============================
// DEPOSIT SUCCESS — DONE BUTTON
// ==============================
const depositSuccessDone =
  document.getElementById("depositSuccessDone");

if (depositSuccessDone) {
  depositSuccessDone.addEventListener("click", () => {
    const successSection =
      document.getElementById("depositSuccessSection");

    if (successSection) {
      successSection.style.display = "none";
    }

    // Return to the Home screen.
    const homeSection = document.getElementById("homeSection");

    if (homeSection) {
      homeSection.style.display = "block";
    }

    window.scrollTo(0, 0);
  });
}


/* ==========================================
   VEYRA ADMIN DASHBOARD
   ========================================== */

(function setupVeyraAdminDashboard() {
  const app = document.querySelector(".app");
  const main = document.querySelector("main");
  const topActions = document.querySelector(".top-actions");
  const bottomNav = document.querySelector(".bottom-nav");

  if (!app || !main || !topActions) {
    console.error("Veyra admin: Required app elements were not found.");
    return;
  }

  // Create the dashboard without replacing existing HTML.
  const dashboard = document.createElement("section");
  dashboard.id = "adminDashboardSection";
  dashboard.style.cssText =
    "display:none;padding:20px 16px 100px;max-width:900px;margin:0 auto;";

  dashboard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
      <div>
        <h2 style="margin-bottom:5px;">Admin Dashboard</h2>
        <p style="margin-top:0;color:#777;">Manage deposit requests</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button type="button" id="adminRefreshButton" class="secondary-button">
          Refresh
        </button>
        <button type="button" id="adminCloseButton" class="secondary-button">
          Close
        </button>
      </div>
    </div>

    <p id="adminDashboardMessage" role="status" style="margin:16px 0;"></p>
    <div id="adminDepositList"></div>
  `;

  if (bottomNav && bottomNav.parentNode === app) {
    app.insertBefore(dashboard, bottomNav);
  } else {
    app.appendChild(dashboard);
  }

  const adminButton = document.createElement("button");
  adminButton.type = "button";
  adminButton.id = "openAdminDashboardButton";
  adminButton.textContent = "Admin";
  adminButton.className = "secondary-button";
  adminButton.style.display = "none";
  topActions.appendChild(adminButton);

  const message = dashboard.querySelector("#adminDashboardMessage");
  const list = dashboard.querySelector("#adminDepositList");
  const refreshButton = dashboard.querySelector("#adminRefreshButton");
  const closeButton = dashboard.querySelector("#adminCloseButton");

  function showAdminMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "#16803c" : "#555";
  }

  function hideDashboard() {
    dashboard.style.display = "none";
  }

  function openDashboard() {
    document.querySelectorAll("main > section").forEach((section) => {
      section.style.display = "none";
    });

    dashboard.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadDepositRequests();
  }

  adminButton.addEventListener("click", () => {
    if (dashboard.style.display === "block") {
      hideDashboard();

      if (typeof showHomeSection === "function") {
        showHomeSection();
      }
    } else {
      openDashboard();
    }
  });

  closeButton.addEventListener("click", () => {
    hideDashboard();

    if (typeof showHomeSection === "function") {
      showHomeSection();
    }
  });

  refreshButton.addEventListener("click", loadDepositRequests);

  // Hide the dashboard when the user switches to another app section.
  [
    "homeNavButton",
    "walletNavButton",
    "profileNavButton"
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", hideDashboard);
  });

  async function checkAdminAccess() {
    const { data: sessionData } =
      await supabaseClient.auth.getSession();

    if (!sessionData.session) {
      adminButton.style.display = "none";
      hideDashboard();
      return;
    }

    const { data, error } =
      await supabaseClient.rpc("is_veyra_admin");

    if (error || data !== true) {
      adminButton.style.display = "none";
      hideDashboard();
      return;
    }

    adminButton.style.display = "inline-block";
  }

  async function loadDepositRequests() {
    list.replaceChildren();
    showAdminMessage("Loading deposit requests...");

    const { data: requests, error } = await supabaseClient
      .from("deposit_requests")
      .select("id,user_id,amount,proof_path,status,created_at,admin_note")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin deposits error:", error);
      showAdminMessage(
        "Could not load deposits. Check your admin access and Supabase policies."
      );
      return;
    }

    if (!requests || requests.length === 0) {
      showAdminMessage("No deposit requests yet.", true);
      return;
    }

    // Load profile names where available.
    const userIds = [...new Set(requests.map((item) => item.user_id))];
    const profilesById = {};

    const { data: profiles, error: profileError } = await supabaseClient
      .from("profile")
      .select("id,username,email,first_name,last_name")
      .in("id", userIds);

    if (!profileError && profiles) {
      profiles.forEach((profile) => {
        profilesById[profile.id] = profile;
      });
    }

    showAdminMessage(`${requests.length} deposit request(s) found.`);

    for (const request of requests) {
      const profile = profilesById[request.user_id];
      const card = document.createElement("article");

      card.style.cssText =
        "background:#fff;border:1px solid #e5e1dc;border-radius:16px;padding:16px;margin:14px 0;box-shadow:0 3px 12px rgba(0,0,0,.04);";

      const title = document.createElement("h3");
      title.textContent =
        profile?.username
          ? `@${profile.username}`
          : `User ${request.user_id.slice(0, 8)}`;
      title.style.marginTop = "0";

      const details = document.createElement("p");
      details.style.cssText = "line-height:1.8;overflow-wrap:anywhere;";
      details.textContent =
        `Amount: ₦${Number(request.amount).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}\n` +
        `Email: ${profile?.email || "Not available"}\n` +
        `Submitted: ${new Date(request.created_at).toLocaleString()}\n` +
        `Status: ${request.status}`;

      details.style.whiteSpace = "pre-line";

      const receiptButton = document.createElement("button");
      receiptButton.type = "button";
      receiptButton.className = "secondary-button";
      receiptButton.textContent = "Open payment receipt";
      receiptButton.style.marginRight = "8px";

      receiptButton.addEventListener("click", async () => {
        receiptButton.disabled = true;
        receiptButton.textContent = "Opening receipt...";

        try {
          const { data, error: receiptError } =
            await supabaseClient.storage
              .from("deposit-proofs")
              .createSignedUrl(request.proof_path, 300);

          if (receiptError) throw receiptError;

          if (!data?.signedUrl) {
            throw new Error("Receipt link could not be created.");
          }

          window.open(data.signedUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
          console.error("Receipt access error:", error);
          alert(error.message || "Unable to open this receipt.");
        } finally {
          receiptButton.disabled = false;
          receiptButton.textContent = "Open payment receipt";
        }
      });

      card.append(title, details, receiptButton);

      if (request.admin_note) {
        const note = document.createElement("p");
        note.textContent = `Admin note: ${request.admin_note}`;
        card.appendChild(note);
      }

      if (request.status === "pending") {
        const approveButton = document.createElement("button");
        approveButton.type = "button";
        approveButton.textContent = "Approve deposit";
        approveButton.style.cssText =
          "background:#16803c;color:white;border:0;border-radius:12px;padding:12px;margin:10px 8px 0 0;cursor:pointer;";

        const rejectButton = document.createElement("button");
        rejectButton.type = "button";
        rejectButton.textContent = "Reject deposit";
        rejectButton.style.cssText =
          "background:#b42318;color:white;border:0;border-radius:12px;padding:12px;margin-top:10px;cursor:pointer;";

        approveButton.addEventListener("click", async () => {
          const confirmed = window.confirm(
            `Approve ₦${Number(request.amount).toLocaleString("en-NG")} for this user?\n\nOnly approve after verifying the actual payment.`
          );

          if (!confirmed) return;

          const note = window.prompt("Optional admin note:", "");
          if (note === null) return;

          approveButton.disabled = true;
          rejectButton.disabled = true;
          showAdminMessage("Approving deposit...");

          try {
            const { error: approvalError } = await supabaseClient.rpc(
              "approve_deposits",
              {
                p_deposit_id: request.id,
                p_admin_note: note.trim() || null
              }
            );

            if (approvalError) throw approvalError;

            showAdminMessage("Deposit approved. Refreshing requests...", true);
            await loadDepositRequests();
          } catch (error) {
            console.error("Deposit approval error:", error);
            showAdminMessage(
              error.message || "Approval failed. No success was confirmed."
            );
            approveButton.disabled = false;
            rejectButton.disabled = false;
          }
        });

        rejectButton.addEventListener("click", async () => {
          const confirmed = window.confirm(
            "Reject this deposit request?"
          );

          if (!confirmed) return;

          const note = window.prompt("Reason for rejection:", "");
          if (note === null) return;

          if (!note.trim()) {
            alert("Please enter a reason for rejection.");
            return;
          }

          approveButton.disabled = true;
          rejectButton.disabled = true;
          showAdminMessage("Rejecting deposit...");

          try {
            const { error: rejectionError } = await supabaseClient.rpc(
              "reject_deposits",
              {
                p_deposit_id: request.id,
                p_admin_note: note.trim()
              }
            );

            if (rejectionError) throw rejectionError;

            showAdminMessage("Deposit rejected. Refreshing requests...", true);
            await loadDepositRequests();
          } catch (error) {
            console.error("Deposit rejection error:", error);
            showAdminMessage(
              error.message || "Rejection failed. Please try again."
            );
            approveButton.disabled = false;
            rejectButton.disabled = false;
          }
        });

        card.append(approveButton, rejectButton);
      }

      list.appendChild(card);
    }
  }

  // Check access on page load, login, and logout.
  supabaseClient.auth.getSession().then(() => checkAdminAccess());

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      setTimeout(checkAdminAccess, 0);
    }

    if (event === "SIGNED_OUT") {
      adminButton.style.display = "none";
      hideDashboard();
    }
  });
})();
