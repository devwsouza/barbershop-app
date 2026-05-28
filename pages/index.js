import { useEffect, useState } from "react";

const horarios = [
  "08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00"
];

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [barberId, setBarberId] = useState("1");

  // ✅ CRM
  const [clients, setClients] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  const getTenantId = () => {
    if (typeof window !== "undefined") {
      const tenantId = localStorage.getItem("tenantId");
      return tenantId && tenantId !== "undefined" ? tenantId : null;
    }
    return null;
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ✅ MAIS RÁPIDO
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente";
  };

  // ✅ AGENDAMENTOS
  const loadAppointments = async () => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const res = await fetch(
        "https://barbershop-full-gah5.onrender.com/appointments",
        {
          headers: { tenantId },
          cache: "no-store"
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (Array.isArray(data)) {
        setAppointments(data);
      }

    } catch (err) {
      console.error("Erro appointments:", err);
    }
  };

  // ✅ CLIENTES
  const loadClients = async () => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const res = await fetch(
        "https://barbershop-full-gah5.onrender.com/clients",
        {
          headers: { tenantId },
          cache: "no-store"
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (Array.isArray(data)) {
        setClients(data);
      }

    } catch (err) {
      console.error("Erro clients:", err);
    }
  };

  // ✅ CRIAR CLIENTE (ATUALIZA IMEDIATO)
  const createClient = async () => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      await fetch(
        "https://barbershop-full-gah5.onrender.com/clients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            tenantId
          },
          body: JSON.stringify({
            name: clientName,
            phone: clientPhone
          })
        }
      );

      setClientName("");
      setClientPhone("");

      await loadClients();

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CRIAR AGENDAMENTO (SINCRONIZA CLIENTE TAMBÉM)
  const createAppointment = async (hora) => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      await fetch("https://barbershop-full-gah5.onrender.com/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          tenantId
        },
        body: JSON.stringify({
          barberId,
          time: hora,
          clientId: selectedClient || null
        })
      });

      // ✅ sincronização imediata completa
      await loadAppointments();
      await loadClients();

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CANCELAR (SEGURANÇA + ATUALIZAÇÃO)
  const cancelAppointment = async (id) => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const res = await fetch(
        `https://barbershop-full-gah5.onrender.com/appointments/${id}`,
        {
          method: "DELETE",
          headers: { tenantId }
        }
      );

      if (!res.ok) {
        console.error("Erro ao cancelar:", res.status);
        return;
      }

      await loadAppointments();

    } catch (err) {
      console.error("Erro ao cancelar:", err);
    }
  };

  // ✅ SINCRONIZAÇÃO (AGORA MAIS RÁPIDA)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tenantId = localStorage.getItem("tenantId");

    if (!tenantId || tenantId === "undefined") {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    loadAppointments();
    loadClients();

    // 🚀 reduzido de 5s → 3s
    const interval = setInterval(() => {
      loadAppointments();
      loadClients();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        💈 Barbearia Pro
        
        <button
          onClick={() => window.location.href = "/clients"}
          style={{ marginLeft: 10 }}
        >
          Clientes
        </button>

        <button onClick={logout} style={styles.logout}>
          Sair
        </button>
      </div>

      <div style={styles.content}>

        {/* CRM */}
        <div style={styles.crmBox}>
          <h3>Novo Cliente</h3>

          <input
            placeholder="Nome"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />

          <input
            placeholder="Telefone"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />

          <button onClick={createClient}>
            Cadastrar Cliente
          </button>

          <br /><br />

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">Selecionar cliente</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* AGENDA */}
        <div style={styles.topBar}>
          <h2>Agenda</h2>

          <select
            value={barberId}
            onChange={(e) => setBarberId(e.target.value)}
          >
            <option value="1">Barbeiro 1</option>
            <option value="2">Barbeiro 2</option>
          </select>
        </div>

        <div style={styles.grid}>
          {horarios.map(hora => {

            const agendamento = appointments.find(
              a => a.time === hora && a.barberId === barberId
            );

            return (
              <div key={hora} style={styles.card}>
                <div style={styles.time}>{hora}</div>

                {agendamento ? (
                  <>
                    <span style={styles.clientName}>
                      {agendamento.clientId
                        ? getClientName(agendamento.clientId)
                        : "Agendado"}
                    </span>

                    <button onClick={() => cancelAppointment(agendamento.id)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button onClick={() => createAppointment(hora)}>
                    Agendar
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    background: "#f1f5f9",
    minHeight: "100vh"
  },

  header: {
    background: "#0f172a",
    color: "white",
    padding: 20,
    display: "flex",
    justifyContent: "space-between"
  },

  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer"
  },

  content: {
    padding: 20,
    maxWidth: 900,
    margin: "0 auto"
  },

  crmBox: {
    marginBottom: 20
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 10
  },

  card: {
    padding: 15,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "white"
  },

  time: {
    fontWeight: "bold",
    marginBottom: 10
  },

  clientName: {
    display: "block",
    color: "#22c55e",
    fontWeight: "bold",
    marginBottom: 10
  }
};