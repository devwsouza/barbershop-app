import { useEffect, useState } from "react";

export default function Clients() {
  const [clients, setClients] = useState([]);

  const getTenantId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tenantId");
    }
    return null;
  };

  const loadClients = async () => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const res = await fetch(
        "https://barbershop-full-gah5.onrender.com/clients",
        {
          headers: { tenantId }
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (Array.isArray(data)) {
        setClients(data);
      } else {
        setClients([]); // ✅ evita crash
      }

    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  
  const deleteClient = async (id) => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const res = await fetch(
        `https://barbershop-full-gah5.onrender.com/clients/${id}`,
        {
          method: "DELETE",
          headers: { tenantId }
        }
      );

      // ✅ não tenta ler JSON (evita crash)
      if (!res.ok) {
        console.error("Erro ao excluir:", res.status);
        return;
      }

      loadClients();

    } catch (err) {
      console.error("Erro delete:", err);
    }
  };


  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const tenantId = getTenantId();

    if (!tenantId) {
      window.location.href = "/login";
      return;
    }

    loadClients();
  }, []);

  return (
    <div style={{ padding: 20 }}>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Clientes</h1>

        <div>
          <button onClick={() => window.location.href = "/"}>
            Voltar
          </button>

          <button onClick={logout} style={{ marginLeft: 10 }}>
            Sair
          </button>
        </div>
      </div>

      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.phone}</td>
              <td>
                <button onClick={() => deleteClient(client.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}