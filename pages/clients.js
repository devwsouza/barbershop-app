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
    const tenantId = getTenantId();
    if (!tenantId) return;

    const res = await fetch(
      "https://barbershop-full-gah5.onrender.com/clients",
      {
        headers: { tenantId }
      }
    );

    const data = await res.json();
    setClients(data);
  };

  const deleteClient = async (id) => {
    const tenantId = getTenantId();
    if (!tenantId) return;

    await fetch(
      `https://barbershop-full-gah5.onrender.com/clients/${id}`,
      {
        method: "DELETE",
        headers: { tenantId }
      }
    );

    loadClients();
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