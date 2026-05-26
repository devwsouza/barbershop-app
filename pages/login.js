const login = async () => {
  try {
    const res = await fetch(
      "https://barbershop-full-gah5.onrender.com/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    console.log("STATUS:", res.status);

    if (!res.ok) {
      alert("Usuário ou senha inválidos");
      return;
    }

    const user = await res.json();

    console.log("USER:", user);

    if (!user || !user.tenantId) {
      alert("Login inválido (sem tenantId)");
      return;
    }

    localStorage.setItem("tenantId", user.tenantId);

    window.location.href = "/";
  } catch (err) {
    console.error("Erro login:", err);
    alert("Erro ao fazer login");
  }
};