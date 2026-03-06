const ADMIN_USER = "gun_admin";
const ADMIN_PASSWORD_HASH = "7b88539182a483e7beda49ce4fda438ce3912594d778c43d6078a89972793187";
const SESSION_KEY = "gun_legislative_admin";

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("");

const sha256 = async (value) => {
  const raw = new TextEncoder().encode(value);
  return toHex(await crypto.subtle.digest("SHA-256", raw));
};

const setMessage = (node, text, kind) => {
  if (!node) {
    return;
  }

  node.textContent = text;
  node.classList.remove("error", "ok");
  if (kind) {
    node.classList.add(kind);
  }
};

const loginForm = document.querySelector("[data-admin-login-form]");
if (loginForm) {
  const msgNode = loginForm.querySelector("[data-auth-message]");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!username || !password) {
      setMessage(msgNode, "Заполните логин и пароль.", "error");
      return;
    }

    const hash = await sha256(password);
    if (username !== ADMIN_USER || hash !== ADMIN_PASSWORD_HASH) {
      setMessage(msgNode, "Доступ отклонён: неверные учётные данные.", "error");
      return;
    }

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        username: ADMIN_USER,
        authAt: Date.now()
      })
    );

    setMessage(msgNode, "Аутентификация подтверждена. Перенаправление...", "ok");
    window.setTimeout(() => {
      window.location.href = "./administrative-digest.html";
    }, 350);
  });
}

const dashboardRoot = document.querySelector("[data-admin-dashboard]");
if (dashboardRoot) {
  const payload = sessionStorage.getItem(SESSION_KEY);
  if (!payload) {
    window.location.replace("./access-directive-73.html");
  } else {
    try {
      const data = JSON.parse(payload);
      const userNode = document.querySelector("[data-admin-user]");
      const authDateNode = document.querySelector("[data-admin-auth-date]");

      if (userNode) {
        userNode.textContent = data.username;
      }

      if (authDateNode && data.authAt) {
        authDateNode.textContent = new Date(data.authAt).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.replace("./access-directive-73.html");
    }
  }

  const logoutButton = dashboardRoot.querySelector("[data-admin-logout]");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.replace("./access-directive-73.html");
    });
  }
}
