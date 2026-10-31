import StatusBadge from "./StatusBadge";

function ProgressBar({ stages }) {
  return (
    <div className="pipeline-progress">
      {stages.map((stage, index) => (
        <div className="pipeline-step" key={stage.name}>
          <div className={`step-circle step-${stage.status}`}>
            {stage.status === "success"
              ? "✓"
              : index + 1}
          </div>

          <div className="step-content">
            <div className="step-header">
              <span>{stage.name}</span>
              <StatusBadge status={stage.status} />
            </div>

            <span className="step-description">
              {stage.description}
            </span>
          </div>

          {index < stages.length - 1 && (
            <div
              className={`step-line ${
                stage.status === "success"
                  ? "line-complete"
                  : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default ProgressBar;