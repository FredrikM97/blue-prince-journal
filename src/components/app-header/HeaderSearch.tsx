import { Search } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import type { RefObject } from "react";
import { useStore } from "@/hooks/useStore";
import { InputField } from "@/components/common/input/InputField";
import { SuggestionsDropdown } from "@/components/common/suggestions/SuggestionsDropdown";
import { Stack } from "@/components/common/general/Stack";

export function HeaderSearch({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const [searchInput, setSearchInput] = useState(search);
  const deferredSearchInput = useDeferredValue(searchInput);
  const hasSearchText = searchInput.trim().length > 0;

  useEffect(() => {
    if (deferredSearchInput !== search) {
      setSearch(deferredSearchInput);
    }
  }, [deferredSearchInput, search, setSearch]);

  return (
    <Stack className="relative w-28 sm:w-36 lg:w-auto" gap="0">
      <Search
        className={`pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground ${hasSearchText ? "hidden" : ""}`}
      />
      <SuggestionsDropdown
        dropdownClassName="left-0 right-auto top-[calc(100%+0.25rem)] min-w-56 max-w-80"
        showSuggestionHint={false}
        displayMode="plain"
        includeTypeSuggestions={false}
        includeDateSuggestions={false}
        dropdownAlign="left"
        preservePrefixesInPlainMode={["@", "#", "^"]}
      >
        <InputField
          label="Search"
          hideLabel
          inputRef={inputRef}
          value={searchInput}
          onChange={setSearchInput}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSearchInput("");
              inputRef.current?.blur();
            }
          }}
          placeholder=" "
          size="sm"
          inputClassName={`w-full lg:w-44 ${hasSearchText ? "pl-3" : "pl-8"}`}
        />
      </SuggestionsDropdown>
    </Stack>
  );
}
