const BASE =
  "block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50";
const NORMAL = "border-[#D8E3ED] focus:border-[#8FB0CE] focus:ring-[#8FB0CE]/20";
const INVALID = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

export function TextField({
  id,
  name,
  label,
  type = "text",
  defaultValue = "",
  error,
  hint,
  required = false,
  multiline = false,
  ...rest
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;
  const { className = "", ...inputRest } = rest;

  const props = {
    id,
    name,
    defaultValue,
    required,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedBy,
    className: className || `${BASE} ${error ? INVALID : NORMAL}`,
    ...inputRest,
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-red-600">
            *
          </span>
        ) : null}
      </label>
      {multiline ? <textarea rows={4} {...props} /> : <input type={type} {...props} />}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
