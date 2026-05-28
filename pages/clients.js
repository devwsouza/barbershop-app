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
      }

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ EDITAR (ATUALIZA NA HORA)
  const editClient = async (client) => {
    const newName = prompt("Novo nome:", client.name);
    const newPhone = prompt("Novo telefone:", client.phone);

    if (!newName || !newPhone) return;

    const tenantId = getTenantId();

    try {
      await fetch(
        `https://barbershop-full-gah5.onrender.com/clients/${client.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            tenantId
          },
          body: JSON.stringify({ name: newName, phone: newPhone })
        }
      );

      // ⚡ UPDATE IMEDIATO (SEM ESPERAR BACKEND)
      setClients(prev =>
        prev.map(c =>
          c.id === client.id ? { ...c, name: newName, phone: newPhone } : c
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ EXCLUIR (REMOVE IMEDIATO DA TELA)
  const deleteClient = async (id) => {
    const tenantId = getTenantId();

    try {
      await fetch(
        `https://barbershop-full-gah5.onrender.com/clients/${id}`,
        {
          method: "DELETE",
          headers: { tenantId }
        }
      );

      // ⚡ REMOVE IMEDIATO
      setClients(prev => prev.filter(c => c.id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  const showHistory = async (client) => {
    try {
      const res = await fetch(
        `https://barbershop-full-gah5.onrender.com/appointments/client/${client.id}`
      );

      const data = await res.json();

      const horarios = data.map(a => a.time).join(", ");

      alert(
        `${client.name} teve ${data.length} atendimento(s)\n\nHorários: ${horarios || "Nenhum"}`
      );

    } catch {
      alert("Erro ao carregar histórico");
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
                <button onClick={() => editClient(client)}>Editar</button>
                <button onClick={() => deleteClient(client.id)}>Excluir</button>
                <button onClick={() => showHistory(client)}>Histórico</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}