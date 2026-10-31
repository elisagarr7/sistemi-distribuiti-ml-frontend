function StatusBadge({ status }) {
  const labels = {
    idle: "In attesa",
    running: "In esecuzione",
    success: "Completato",
    error: "Errore",
  };

  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" />
      {labels[status] || status}
    </span>
  );
}

export default StatusBadge;