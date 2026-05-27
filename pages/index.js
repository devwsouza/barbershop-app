import { useEffect, useState } from "react";

const horarios = [
  "08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00"
];

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [barberId, setBarberId] = useState("1");

  // 🔥 CRM
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

  // ✅ AGENDAMENTOS
  const loadAppointments = async () => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      const res = await fetch(
        "https://barbershop-full-gah5.onrender.com/appointments",
        {
          headers: { tenantId }
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CLIENTES (CRM)
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

  // ✅ CRIAR CLIENTE
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
      loadClients();

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CRIAR AGENDAMENTO (AGORA COM CLIENTE)
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

      loadAppointments();

    } catch (err) {
      console.error(err);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return;

      await fetch(
        `https://barbershop-full-gah5.onrender.com/appointments/${id}`,
        {
          method: "DELETE",
          headers: { tenantId }
        }
      );

      loadAppointments();

    } catch (err) {
      console.error(err);
    }
  };

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

  }, []);

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        💈 Barbearia Pro
      </div>

      <div style={styles.content}>

        {/* 🔥 CRM */}
        <div style={{ marginBottom: 20 }}>
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
                <div>{hora}</div>

                {agendamento ? (
                  <>
                    <span>Agendado</span>
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
  container: { padding: 20 },
  content: { maxWidth: 900, margin: "0 auto" },
  grid: { display: "grid", gap: 10 },
  card: { padding: 10, border: "1px solid #ccc" }
};