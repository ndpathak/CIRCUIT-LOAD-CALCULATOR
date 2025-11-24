import React, { useState } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle, Zap, Info } from "lucide-react";

export default function ElectricalLoadCalculator() {
  const [circuits, setCircuits] = useState([
    {
      id: 1,
      name: "Kitchen Circuit",
      voltage: 120,
      breakerRating: 20,
      devices: [
        { id: 1, name: "Microwave", watts: 1200 },
        { id: 2, name: "Coffee Maker", watts: 900 },
      ],
    },
  ]);

  const [selectedCircuit, setSelectedCircuit] = useState(0);
  const [newDevice, setNewDevice] = useState({ name: "", watts: "" });
  const [newCircuit, setNewCircuit] = useState({ name: "", voltage: 120, breakerRating: 15 });
  const [showAddCircuit, setShowAddCircuit] = useState(false);

  const addCircuit = () => {
    if (newCircuit.name && newCircuit.voltage && newCircuit.breakerRating) {
      setCircuits([
        ...circuits,
        {
          id: Date.now(),
          name: newCircuit.name,
          voltage: parseFloat(newCircuit.voltage),
          breakerRating: parseFloat(newCircuit.breakerRating),
          devices: [],
        },
      ]);
      setNewCircuit({ name: "", voltage: 120, breakerRating: 15 });
      setShowAddCircuit(false);
    }
  };

  const removeCircuit = (circuitId) => {
    setCircuits(circuits.filter((c) => c.id !== circuitId));
    if (selectedCircuit >= circuits.length - 1) {
      setSelectedCircuit(Math.max(0, circuits.length - 2));
    }
  };

  const addDevice = () => {
    if (newDevice.name && newDevice.watts && circuits.length > 0) {
      const watts = parseFloat(newDevice.watts);
      if (watts <= 0) return;
      
      const updatedCircuits = [...circuits];
      updatedCircuits[selectedCircuit].devices.push({
        id: Date.now(),
        name: newDevice.name,
        watts: watts,
      });
      setCircuits(updatedCircuits);
      setNewDevice({ name: "", watts: "" });
    }
  };

  const removeDevice = (deviceId) => {
    const updatedCircuits = [...circuits];
    updatedCircuits[selectedCircuit].devices = updatedCircuits[selectedCircuit].devices.filter(
      (d) => d.id !== deviceId
    );
    setCircuits(updatedCircuits);
  };

  const calculateLoad = (circuit) => {
    const totalWatts = circuit.devices.reduce((sum, d) => sum + d.watts, 0);
    const totalAmps = totalWatts / circuit.voltage;
    const maxAmps = circuit.breakerRating;
    const usagePercent = (totalAmps / maxAmps) * 100;
    const safeMaxAmps = maxAmps * 0.8;

    return {
      totalWatts,
      totalAmps,
      maxAmps,
      usagePercent,
      safeMaxAmps,
      isOverloaded: totalAmps > maxAmps,
      isNearLimit: totalAmps > safeMaxAmps && totalAmps <= maxAmps,
      isSafe: totalAmps <= safeMaxAmps,
      availableAmps: maxAmps - totalAmps,
      availableWatts: (maxAmps - totalAmps) * circuit.voltage,
    };
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  if (circuits.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyCard}>
          <Zap style={{ width: 64, height: 64, margin: "0 auto", color: "#4f46e5" }} />
          <h2 style={styles.emptyTitle}>No Circuits Yet</h2>
          <p style={styles.emptyText}>
            Create your first circuit to start calculating electrical loads.
          </p>
          <button onClick={() => setShowAddCircuit(true)} style={styles.primaryButton}>
            Create Circuit
          </button>
        </div>
      </div>
    );
  }

  const currentCircuit = circuits[selectedCircuit];
  const load = calculateLoad(currentCircuit);

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Zap style={{ width: 32, height: 32, color: "#4f46e5" }} />
            <h1 style={styles.title}>Electrical Load Calculator ⚡</h1>
          </div>
          <button onClick={() => setShowAddCircuit(!showAddCircuit)} style={styles.primaryButton}>
            <Plus style={{ width: 20, height: 20 }} />
            <span style={{ marginLeft: 8 }}>New Circuit</span>
          </button>
        </div>

        {/* CIRCUIT CREATOR */}
        {showAddCircuit && (
          <div style={styles.addCircuitBox}>
            <h3 style={styles.sectionSubtitle}>Add New Circuit</h3>
            <div style={styles.gridFour}>
              <input
                type="text"
                placeholder="Circuit name"
                value={newCircuit.name}
                onChange={(e) => setNewCircuit({ ...newCircuit, name: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, addCircuit)}
                style={styles.input}
              />
              <select
                value={newCircuit.voltage}
                onChange={(e) => setNewCircuit({ ...newCircuit, voltage: parseFloat(e.target.value) })}
                style={styles.input}
              >
                <option value={120}>120V</option>
                <option value={240}>240V</option>
              </select>
              <select
                value={newCircuit.breakerRating}
                onChange={(e) => setNewCircuit({ ...newCircuit, breakerRating: parseFloat(e.target.value) })}
                style={styles.input}
              >
                <option value={15}>15A</option>
                <option value={20}>20A</option>
                <option value={30}>30A</option>
                <option value={40}>40A</option>
                <option value={50}>50A</option>
              </select>
              <button onClick={addCircuit} style={styles.successButton}>
                Add Circuit
              </button>
            </div>
          </div>
        )}

        {/* CIRCUIT TABS */}
        <div style={styles.tabContainer}>
          {circuits.map((circuit, i) => (
            <div key={circuit.id} style={styles.tabWrapper}>
              <button
                onClick={() => setSelectedCircuit(i)}
                style={selectedCircuit === i ? styles.tabActive : styles.tabInactive}
              >
                {circuit.name}
              </button>
              {circuits.length > 1 && (
                <button onClick={() => removeCircuit(circuit.id)} style={styles.deleteIcon}>
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* STATS GRID */}
        <div style={styles.gridTwo}>
          {/* Circuit Specs */}
          <div style={styles.specPanel}>
            <h3 style={styles.panelTitle}>Circuit Specifications</h3>
            <SpecRow label="Voltage:" value={`${currentCircuit.voltage}V`} />
            <SpecRow label="Breaker Rating:" value={`${currentCircuit.breakerRating}A`} />
            <SpecRow label="Max Capacity:" value={`${(currentCircuit.voltage * currentCircuit.breakerRating).toLocaleString()}W`} />
            <SpecRow label="Safe (80%):" value={`${(load.safeMaxAmps * currentCircuit.voltage).toLocaleString()}W`} />
          </div>

          {/* Load Indicator */}
          <div style={getLoadBoxStyle(load)}>
            <div style={styles.loadHeader}>
              {load.isOverloaded ? (
                <AlertTriangle style={{ color: "#dc2626" }} />
              ) : load.isNearLimit ? (
                <AlertTriangle style={{ color: "#ca8a04" }} />
              ) : (
                <CheckCircle style={{ color: "#15803d" }} />
              )}
              <h3 style={styles.loadTitle}>
                {load.isOverloaded ? "OVERLOADED!" : load.isNearLimit ? "Near Limit" : "Safe Load"}
              </h3>
            </div>
            <div style={{ marginTop: 12 }}>
              <SpecRow label="Current Draw:" value={`${load.totalAmps.toFixed(2)}A / ${load.maxAmps}A`} />
              <SpecRow label="Total Load:" value={`${load.totalWatts.toLocaleString()}W`} />
              <SpecRow label="Usage:" value={`${load.usagePercent.toFixed(1)}%`} />
              <div style={styles.progressBarBg}>
                <div style={getProgressBarStyle(load)}></div>
              </div>
            </div>
          </div>
        </div>

        {/* NEC INFO */}
        <div style={styles.infoBox}>
          <Info style={{ color: "#2563eb", flexShrink: 0 }} />
          <div>
            <p style={styles.infoTitle}>NEC Guidelines:</p>
            <p style={styles.infoText}>
              The 80% rule protects against breaker trips from continuous loads (3+ hours).
              Remaining capacity: <b>{load.availableWatts.toFixed(0)}W</b> or <b>{load.availableAmps.toFixed(2)}A</b>
            </p>
          </div>
        </div>

        {/* ADD DEVICE */}
        <h2 style={styles.sectionTitle}>Add Device to Circuit</h2>
        <div style={styles.gridThree}>
          <input
            type="text"
            placeholder="Device name"
            value={newDevice.name}
            onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
            onKeyPress={(e) => handleKeyPress(e, addDevice)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Watts"
            min="1"
            value={newDevice.watts}
            onChange={(e) => setNewDevice({ ...newDevice, watts: e.target.value })}
            onKeyPress={(e) => handleKeyPress(e, addDevice)}
            style={styles.input}
          />
          <button onClick={addDevice} style={styles.primaryButton}>
            <Plus style={{ width: 20, height: 20 }} />
            <span style={{ marginLeft: 8 }}>Add Device</span>
          </button>
        </div>

        {/* DEVICE LIST */}
        <h2 style={styles.sectionTitle}>Devices on Circuit</h2>
        {currentCircuit.devices.length === 0 ? (
          <div style={styles.emptyDevices}>No devices added yet.</div>
        ) : (
          currentCircuit.devices.map((device) => {
            const amps = device.watts / currentCircuit.voltage;
            const percent = (amps / load.maxAmps) * 100;

            return (
              <div key={device.id} style={styles.deviceCard}>
                <div>
                  <h3 style={styles.deviceName}>{device.name}</h3>
                  <p style={styles.deviceStats}>
                    {device.watts}W • {amps.toFixed(2)}A •{" "}
                    <span style={{ color: "#4f46e5", fontWeight: 600 }}>
                      {percent.toFixed(1)}%
                    </span>
                  </p>
                </div>
                <button onClick={() => removeDevice(device.id)} style={styles.deleteIcon}>
                  <Trash2 style={{ width: 20, height: 20 }} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Helper component
function SpecRow({ label, value }) {
  return (
    <div style={styles.specRow}>
      <span style={styles.specLabel}>{label}</span>
      <span style={styles.specValue}>{value}</span>
    </div>
  );
}

// Dynamic styles
function getLoadBoxStyle(load) {
  const base = {
    padding: 16,
    borderRadius: 12,
    border: "2px solid",
  };
  
  if (load.isOverloaded) {
    return { ...base, background: "#fee2e2", borderColor: "#f87171" };
  } else if (load.isNearLimit) {
    return { ...base, background: "#fef9c3", borderColor: "#facc15" };
  } else {
    return { ...base, background: "#dcfce7", borderColor: "#4ade80" };
  }
}

function getProgressBarStyle(load) {
  const base = {
    height: 10,
    borderRadius: 8,
    width: `${Math.min(load.usagePercent, 100)}%`,
    transition: "all 0.3s ease",
  };
  
  if (load.isOverloaded) {
    return { ...base, background: "#dc2626" };
  } else if (load.isNearLimit) {
    return { ...base, background: "#ca8a04" };
  } else {
    return { ...base, background: "#16a34a" };
  }
}

// Static styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
    padding: 24,
  },
  mainCard: {
    maxWidth: 1100,
    margin: "0 auto",
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  emptyCard: {
    background: "#fff",
    padding: 32,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    textAlign: "center",
    maxWidth: 400,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#555",
    marginBottom: 20,
  },
  primaryButton: {
    background: "#4f46e5",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
  },
  successButton: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
  },
  addCircuitBox: {
    background: "#eef2ff",
    padding: 16,
    borderRadius: 8,
    border: "2px solid #c7d2fe",
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    outline: "none",
    fontSize: 14,
  },
  gridFour: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    marginBottom: 24,
  },
  tabContainer: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 8,
    marginBottom: 20,
  },
  tabWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  tabActive: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 500,
  },
  tabInactive: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    background: "#e5e7eb",
    color: "#000",
  },
  deleteIcon: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#dc2626",
    padding: 4,
  },
  specPanel: {
    background: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
  },
  panelTitle: {
    fontWeight: 600,
    marginBottom: 12,
    marginTop: 0,
  },
  specRow: {
    display: "flex",
    justifyContent: "space-between",
    margin: "6px 0",
  },
  specLabel: {
    color: "#555",
  },
  specValue: {
    fontWeight: 600,
  },
  loadHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  loadTitle: {
    fontWeight: 700,
    margin: 0,
  },
  progressBarBg: {
    background: "#e5e7eb",
    height: 10,
    borderRadius: 8,
    marginTop: 10,
    overflow: "hidden",
  },
  infoBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    display: "flex",
    gap: 12,
  },
  infoTitle: {
    fontWeight: 600,
    margin: 0,
    marginBottom: 4,
  },
  infoText: {
    margin: 0,
    fontSize: 14,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 12,
    marginTop: 0,
  },
  sectionSubtitle: {
    fontWeight: 600,
    marginBottom: 8,
    marginTop: 0,
  },
  emptyDevices: {
    textAlign: "center",
    padding: 24,
    color: "#666",
  },
  deviceCard: {
    background: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceName: {
    fontWeight: 600,
    margin: 0,
    marginBottom: 4,
  },
  deviceStats: {
    color: "#555",
    margin: 0,
    fontSize: 14,
  },
};