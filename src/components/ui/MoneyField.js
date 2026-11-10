"use client";

import { useRef } from "react";

const BASE =
  "block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:bg-zinc-100";
const NORMAL = "border-zinc-300 focus:border-indigo-600 focus:ring-indigo-600/25";
const INVALID = "border-red-500 focus:border-red-600 focus:ring-red-600/25";

const onlyDigits = value => String(value ?? "").replace(/\D/g, "");
const formatDigits = digits => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

function caretAfterDigits(formatted, digitCount) {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) seen += 1;
    if (seen === digitCount) return index + 1;
  }
  return formatted.length;
}

// Input nominal menampilkan pemisah ribuan Indonesia, tetapi mengirim digit murni
// melalui hidden input agar server action dan database tetap menerima angka biasa.
export function MoneyField({
  id,
  name,
  label,
  defaultValue = "",
  error,
  hint,
  required = false,
  placeholder = "0",
}) {
  const initialDigits = onlyDigits(defaultValue).replace(/^0+(?=\\d)/, "");
  const initialFormatted = formatDigits(initialDigits);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const hiddenRef = useRef(null);

  function handleChange(event) {
    const input = event.currentTarget;
    const cursor = input.selectionStart ?? input.value.length;
    const digitsBeforeCursor = onlyDigits(input.value.slice(0, cursor)).length;
    const digits = onlyDigits(input.value).replace(/^0+(?=\d)/, "");
    const formatted = formatDigits(digits);

    input.value = formatted;
    if (hiddenRef.current) hiddenRef.current.value = digits;

    const nextCursor = caretAfterDigits(formatted, digitsBeforeCursor);
    input.setSelectionRange(nextCursor, nextCursor);
  }

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
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        defaultValue={initialFormatted}
        placeholder={placeholder}
        required={required}
        maxLength={24}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        onChange={handleChange}
        className={`${BASE} ${error ? INVALID : NORMAL}`}
      />
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={initialDigits} />
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
