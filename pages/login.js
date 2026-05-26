import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        alert("Erro no login (sem tenantId)");
        return;
      }

      localStorage.setItem("tenantId", user.tenantId);

      window.location.href = "/";
    } catch (err) {
      console.error("Erro login:", err);
      alert("Erro ao fazer login");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={login}>Entrar</button>
    </div>
  );
}