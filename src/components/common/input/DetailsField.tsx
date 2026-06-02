/**
 * DetailsField — labeled multiline markdown editor.
 *
 * No suggestion state. For token suggestions wrap it:
 *   <SuggestionsDropdown>
 *     <DetailsField value={v} onChange={set} placeholder="..." />
 *   </SuggestionsDropdown>
 */

import { memo } from "react";
import { MarkdownEditor } from "@/components/common/markdown/MarkdownEditor";
import { MetaText } from "@/components/common/Typography";

function DetailsFieldComponent({
  value,
  onChange,
  onBlur,
  placeholder,
  label = "Details",
  showOptionalHint = true,
  rows = 12,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  label?: string;
  showOptionalHint?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="capture-label">
        {label}
        {showOptionalHint && (
          <MetaText as="span" normalCase opacity="70">
            {" "}
            (optional)
          </MetaText>
        )}
      </label>
      <MarkdownEditor
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

export const DetailsField = memo(DetailsFieldComponent);
