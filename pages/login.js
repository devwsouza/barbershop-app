import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
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

    const user = await res.json();

    // 🔥 salvar tenantId
    localStorage.setItem("tenantId", user.tenantId);

    window.location.href = "/";
  };

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="senha" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Entrar</button>
    </div>
  );
}