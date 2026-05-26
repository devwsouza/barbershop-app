import { useEffect, useState } from "react";

const horarios = [
  "08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00"
];

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [barberId, setBarberId] = useState("1");

  // ✅ pegar tenant com segurança
  const getTenantId = () => {
    if (typeof window !== "undefined") {
      const tenantId = localStorage.getItem("tenantId");
      return tenantId && tenantId !== "undefined" ? tenantId : null;
    }
    return null;
  };

  // ✅ carregar agendamentos (VERSÃO FINAL SEGURA)
  const loadAppointments = async () => {
    try {
      const tenantId = getTenantId();

      // 🚨 não faz requisição inválida
      if (!tenantId) {
        console.log("Sem tenant, abortando request");
        return;
      }

      const res = await fetch(
        "https://barbershop-full-gah5.onrender.com/appointments",
        {
          headers: { tenantId },
          cache: "no-store"
        }
      );

      // ✅ evita erro 500 quebrar o app
      if (!res.ok) {
        console.warn("Erro na API:", res.status);
        return;
      }

      const data = await res.json();

      // ✅ garante que é array
      if (!Array.isArray(data)) {
        console.warn("Resposta inválida:", data);
        return;
      }

      setAppointments(data);

    } catch (err) {
      console.error("Erro ao carregar:", err);
    }
  };

  // ✅ criar agendamento
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
        body: JSON.stringify({ barberId, time: hora })
      });

      loadAppointments();
    } catch (err) {
      console.error("Erro ao criar:", err);
    }
  };

  // ✅ cancelar agendamento
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
      console.error("Erro ao cancelar:", err);
    }
  };

  // ✅ proteção de login + controle de loop
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tenantId = localStorage.getItem("tenantId");

    // 🚨 bloqueia acesso sem login
    if (!tenantId || tenantId === "undefined") {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    loadAppointments();

    const interval = setInterval(() => {
      const tenant = getTenantId();

      // ✅ só executa se tiver tenant válido
      if (tenant) {
        loadAppointments();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        💈 Barbearia Pro
      </div>

      <div style={styles.content}>

        <div style={styles.topBar}>
          <h2>Agenda</h2>

          <select
            value={barberId}
            onChange={(e) => setBarberId(e.target.value)}
            style={styles.select}
          >
            <option value="1">Barbeiro 1</option>
            <option value="2">Barbeiro 2</option>
          </select>
        </div>

        <div style={styles.grid}>
          {horarios.map(hora => {

            const agendamento = appointments.find(
              (a) => a.time === hora && a.barberId === barberId
            );

            return (
              <div
                key={hora}
                style={{
                  ...styles.card,
                  background: agendamento ? "#ecfdf5" : "white"
                }}
              >
                <div style={styles.time}>{hora}</div>

                {agendamento ? (
                  <div style={styles.actions}>
                    <span style={styles.badge}>Agendado</span>

                    <button
                      style={styles.cancelBtn}
                      onClick={() => cancelAppointment(agendamento.id)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    style={styles.button}
                    onClick={() => createAppointment(hora)}
                  >
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

/* 🎨 ESTILOS */
const styles = {
  container: {
    fontFamily: "Arial",
    background: "#f1f5f9",
    minHeight: "100vh"
  },

  header: {
    background: "#0f172a",
    color: "white",
    padding: "20px",
    fontSize: "20px"
  },

  content: {
    padding: "30px",
    maxWidth: "900px",
    margin: "0 auto"
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },

  select: {
    padding: "8px",
    borderRadius: "6px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px"
  },

  card: {
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column"
  },

  time: {
    fontSize: "18px",
    fontWeight: "600"
  },

  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  cancelBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px"
  },

  badge: {
    background: "#22c55e",
    color: "white",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px"
  }
};