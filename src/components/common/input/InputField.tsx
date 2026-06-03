/**
 * InputField — typed field primitive for single-line text and multiline details.
 *
 * No state, no logic. For token suggestions wrap it:
 *   <SuggestionsDropdown value={v} onChange={set} ariaLabel="...">
 *     <InputField label="Title" value={v} onChange={set} />
 *   </SuggestionsDropdown>
 */

import { useId, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { MarkdownEditor } from "@/components/common/markdown/MarkdownEditor";
import { MetaText } from "@/components/common/Typography";

type InputFieldSize = "default" | "sm" | "lg";

function getInputClass({ size, grow }: { size: InputFieldSize; grow: boolean }) {
  let className = "input-base";
  if (size === "sm") className = `${className} h-8`;
  if (size === "lg") className = `${className} h-10`;
  if (grow) className = `${className} flex-1`;
  return className;
}

/** Plain labeled text input. Zero suggestion or key-handling logic. */
export function InputField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  markdown = false,
  rows = 12,
  onBlur,
  onFocus,
  onKeyDown,
  inputRef,
  ariaLabel,
  showOptionalHint = false,
  multiline = false,
  resizable = false,
  size = "default",
  grow = false,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  markdown?: boolean;
  rows?: number;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  ariaLabel?: string;
  showOptionalHint?: boolean;
  multiline?: boolean;
  resizable?: boolean;
  size?: InputFieldSize;
  grow?: boolean;
}) {
  const inputId = useId();

  let field = (
    <input
      id={inputId}
      autoFocus={autoFocus}
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      ref={inputRef as RefObject<HTMLInputElement | null>}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={getInputClass({ size, grow })}
    />
  );

  if (multiline) {
    let textareaClassName = "textarea-base";
    if (resizable) textareaClassName = `${textareaClassName} resize-y`;

    field = (
      <textarea
        id={inputId}
        autoFocus={autoFocus}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        ref={inputRef as RefObject<HTMLTextAreaElement | null>}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-label={ariaLabel}
        className={textareaClassName}
      />
    );
  }

  if (markdown) {
    field = (
      <MarkdownEditor
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
      />
    );
  }

  if (!label) return <>{field}</>;

  return (
    <>
      <label className="capture-label" htmlFor={inputId}>
        {label}
        {showOptionalHint && (
          <MetaText as="span" normalCase opacity="70">
            {" "}
            (optional)
          </MetaText>
        )}
      </label>
      {field}
    </>
  );
}
