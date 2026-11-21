export default function PlanFeaturePicker({ index, options, selected }) {
  return (
    <fieldset className="plan-feature-picker" data-wide>
      <legend>Included features</legend>
      {options.length ? (
        <div className="plan-feature-options">
          {options.map(({ id, values }) => (
            <label key={id}>
              <input
                type="checkbox"
                name={String(index)}
                value={id}
                defaultChecked={selected.includes(id)}
              />
              <span>{values[0]}</span>
            </label>
          ))}
        </div>
      ) : (
        <p>Add features in Feature Management to include them in a plan.</p>
      )}
    </fieldset>
  );
}
