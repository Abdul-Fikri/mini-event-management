const BASE =
  "block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:bg-zinc-100";
const NORMAL = "border-zinc-300 focus:border-indigo-600 focus:ring-indigo-600/25";
const INVALID = "border-red-500 focus:border-red-600 focus:ring-red-600/25";

// Input/textarea dengan label, petunjuk, dan pesan error yang terhubung
// lewat aria-describedby (dapat dibaca pembaca layar).
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

  const props = {
    id,
    name,
    defaultValue,
    required,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedBy,
    className: `${BASE} ${error ? INVALID : NORMAL}`,
    ...rest,
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-800">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-red-600">
            *
          </span>
        ) : null}
      </label>
      {multiline ? <textarea rows={4} {...props} /> : <input type={type} {...props} />}
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
