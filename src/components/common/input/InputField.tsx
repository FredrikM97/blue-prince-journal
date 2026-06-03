/**
 * InputField — typed field primitive for single-line text and multiline details.
 *
 * No state, no logic. For token suggestions wrap it:
 *   <SuggestionsDropdown value={v} onChange={set}>
 *     <InputField label="Title" value={v} onChange={set} />
 *   </SuggestionsDropdown>
 */

import { useId, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { MarkdownEditor } from "@/components/common/markdown/MarkdownEditor";
import { MetaText } from "@/components/common/Typography";

type InputFieldSize = "default" | "sm" | "lg";
type InputFieldWidth = "full" | "fit" | "compact";

function getInputClass({
  size,
  grow,
  width,
}: {
  size: InputFieldSize;
  grow: boolean;
  width: InputFieldWidth;
}) {
  let className = "input-base";
  if (width === "fit") className = `${className} input-width-fit`;
  if (width === "compact") className = `${className} input-width-compact`;
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
  showOptionalHint = false,
  hideLabel = false,
  size = "default",
  grow = false,
  width = "full",
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
  showOptionalHint?: boolean;
  hideLabel?: boolean;
  size?: InputFieldSize;
  grow?: boolean;
  width?: InputFieldWidth;
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
      className={getInputClass({ size, grow, width })}
    />
  );

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

  let labelClassName = "capture-label";
  if (hideLabel) labelClassName = `${labelClassName} sr-only`;

  return (
    <>
      <label className={labelClassName} htmlFor={inputId}>
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
