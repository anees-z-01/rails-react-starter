const FilterTabs = ({ label, options, value, onChange }) => (
  <div className="filters" role="group" aria-label={label}>
    {options.map((option) => (
      <button
        key={option.label}
        type="button"
        className="filters__option"
        aria-pressed={option.value === value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default FilterTabs;
