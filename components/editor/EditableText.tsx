"use client";

import { useCallback, useEffect, useRef } from "react";

interface Props {
  value: string;
  multiline?: boolean;
  className?: string;
  onChange: (next: string) => void;
  /** Aria label for the editable region. */
  label?: string;
  onEditStart?: () => void;
}

/** Inline contentEditable that updates parent state on blur. */
export default function EditableText({
  value,
  multiline = false,
  className,
  onChange,
  label,
  onEditStart,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const editStarted = useRef(false);

  useEffect(() => {
    editStarted.current = false;
  }, [value]);

  /* Keep the DOM synced when the external value changes (eg discard). */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  const onBlur = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = el.innerText.replace(/\u00a0/g, " ");
    if (next !== value) onChange(next);
  }, [value, onChange]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).blur();
      }
    },
    [multiline]
  );

  const onFocus = useCallback(() => {
    if (editStarted.current) return;
    editStarted.current = true;
    onEditStart?.();
  }, [onEditStart]);

  return (
    <div
      ref={ref}
      role="textbox"
      aria-label={label}
      contentEditable
      suppressContentEditableWarning
      className={`editable-text ${className ?? ""}`}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      spellCheck={false}
    />
  );
}
