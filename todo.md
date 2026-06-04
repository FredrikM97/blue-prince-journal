- [x] Prevent long todo titles from overflowing row borders
- [x] Replace native todo delete confirm with in-app delete dialog
- [x] Move todo delete action from dropdown into dedicated delete icon button
- [x] Default Notes status filter to Open
- [x] Make todo right-panel preview include full metadata/details like dialog preview

- [x] Add instruction to avoid feature-level mobile behavior media queries when PageLayout mobile hook exists
- [x] Remove todo-row mobile media-query stacking override in favor of hook-driven mobile behavior contract
- [x] Move edit-note Use existing button to footer action row with attach/cancel/save
- [x] Move edit-note Attach image button to footer near cancel/save like create note
- [x] Make edit-note Cancel fully close mobile right drawer
- [x] Reorder edit-note fields so Tags sits with Date and Type is in top row
- [x] Force compact tags/date input width to fixed 10rem so they stop wrapping to full row
- [x] Make note Tags/Date inputs compact (smaller width/height) for mobile row fit
- [x] Normalize edit-note Type/Status row placement and stacked field wrappers
- [x] Apply compact fit width to tags/date inputs so they can align side by side on mobile
- [x] Make note dropdown labels block-level so labels stay above controls in create/edit panels
- [x] Right-size welcome icons and keep icon above text on welcome cards
- [x] Reduce fit dropdown min width so Type/Room stay side by side on mobile
- [x] Stop todo title button from covering full mobile row width
- [x] Revert PageLayout mobileAutoOpenRightKey prop and use Notes hook-based mobile drawer open
- [x] Double welcome action icons, use horizontal card layout, and remove custom icon class usage
- [x] Increase add-note shortcut key contrast over brass button
- [x] Keep todo tags horizontal and remove hover popup-like action reveal/background
- [x] Auto-open Notes mobile right drawer when Add Note capture opens
- [x] Add fit-width dropdown triggers so create/edit note meta fields align side by side
- [x] Set new note meta rows to Type/Priority+Room then Tags+Date
- [x] Reflow new note meta inputs so Room/Tags share rows with other fields
- [x] Keep tags field grouped with meta controls instead of standalone row
- [x] Make Graph filter toggles use filled active style
- [x] Stop tags input from stretching full width in new/edit note panels
- [x] Increase Welcome menu button icon size
- [x] Adjust Welcome action card sizing to try 3-4 cards in one row on wider screens
- [x] Move global stylesheet into initial HTML load path
- [x] Remove duplicate stylesheet injection from router head
- [x] Remove borders from sidebar detail panels
- [x] Hide unconnected Steam folder from images sidebar
- [x] Add space between graph type dot and label
- [x] Restore SidePanel.Right for note panels
- [x] Remove custom mobile drawer header
- [x] Make mobile side panels fill drawer surface
- [x] Make mobile drawer full width and reusable
- [x] Avoid image preview upscaling blur
- [x] Remove mobile bottom border and add welcome spacing
- [x] Restore title and hide larger-device bottom bar
- [x] Standardize Notes and Settings PageLayout usage
- [x] Make middle scroll behavior default
- [x] Globalize typography and remove font classes
- [x] Add shared Typography component variants
- [x] Lock sidebar wheel scrolling to hovered sidebar pane
- [x] Make graph middle pane non-scrollable and fit viewport
- [x] Add Stack and MetaText primitives and migrate Settings/Notes/Common/Todo/Map/Graph text variants
- [x] Replace inline muted GhostButton classes with shared GhostButton tone variants
- [x] Add layout primitives (Inline/SectionBlock/CenteredContent) and migrate key ad-hoc wrappers
- [x] Unify select trigger rendering for DropdownSelect and RoomDropdown
- [x] Merge select-style button behavior into Button variant API and remove SelectButton usage
- [x] Add oddity audit script for remaining ad-hoc class patterns
- [x] Fix desktop side-panel scroll by removing wheel interception and constraining sidebar height
- [x] Add ESLint custom className-pattern bans in TSX
- [x] Remove className escape hatches from Stack and Heading in favor of explicit variants
- [ ] Runtime-verify first paint loads styled shell on refresh (blocked by missing rolldown native binding in local node_modules)
- [x] Restore global stylesheet import so UI styles load again
- [x] Fix CSS syntax regression in images styles that broke Tailwind build output
- [x] Keep MetaText-based preview label rendering and add typed variant instead of ad-hoc native class usage
- [x] Add lint guard discouraging className on native elements in feature components
- [x] Restore filter select button styling after shared Button migration
- [x] Fix Notes row preview-button layout so list items align vertically again
- [x] Fix Steam connected-folder label placement in settings sync section
- [x] Restore map middle-panel width usage and reduce compacted cell appearance
- [x] Repair dropdown/select trigger behavior after component refactor
- [x] Fix preview metadata row layout/stacking in sidepanel and popup
- [x] Resolve notes list alignment regression after button primitive migration
- [x] Restore rounded/non-flat filter button appearance and spacing
- [x] Add default close (X) control for sidebar panels including empty notes details state
- [x] Fix notes row click behavior (open preview from whole row without inner button highlight)
- [x] Use shared SidePanel header (title/subtitle/X/expand) in images right panel
- [x] Remove notes preview-sidebar close flash by fully hiding panel when no active selection
- [x] Align dropdown trigger colors with attach/images surfaces
- [x] Prevent mobile sidepanel backdrop from darkening the top app header
- [x] Prevent notes list row selection from auto-opening right preview panel
- [x] Add full-control active highlight for mobile left/right panel toggles
- [x] Normalize map cell button sizing/placement across the full grid
- [x] Fix welcome-card text wrapping inside button cards
- [x] Remove GhostButton className escape hatch and replace with typed variants
- [x] Restore full-note hover highlight coverage instead of inner-only highlight
- [x] Remove mobile backdrop button styling artifact that showed as a top bar
- [x] Make mobile side drawers cover full width to avoid map peeking behind panel
- [x] Restore Graph right side panel with visible close X button
- [x] Use shared Button overlay variant for mobile backdrop instead of raw div
- [x] Keep room dropdown trigger value text in muted light-blue tone
- [x] Prevent Graph side panel from auto-opening on initial page entry
- [x] Constrain Notes middle list width to stay within expected center bounds
- [x] Hide visible scrollbars while keeping scroll behavior
- [x] Add explicit Graph mobile right-panel label as Details and restore panel title
- [x] Normalize Welcome action card button sizing
- [x] Merge Todo + Scope into one left panel and remove duplicate close controls
- [x] Improve global filter toggle readability and active-state contrast
- [x] Rebalance mobile side drawer width and preserve overlay behavior
- [x] Restore notes middle-width behavior and keep stable right preview panel slot
- [x] Improve graph canvas fit via graph-specific column widths and full-height SVG
- [x] Revert unsafe graph column overrides that compressed graph/sidenav layout
- [x] Add explicit SidePanel title-bar ownership contract in repo instructions and component docs
- [x] Increase sidebar viewport height usage so side panels appear taller/full-height
- [x] Make filter toggles smaller and switch shared filter toggle grid to full-width single-column rows
- [x] Make right sidebar sit flush to the outer edge on desktop
- [x] Restore map right panel title + close control for empty and selected states
- [x] Reduce sidepanel border noise by using separator-only borders
- [x] Restore responsive multi-column filter toggle layout (not fixed one-column)
- [x] Enforce uniform square map grid buttons
- [x] Align graph content height to viewport to remove extra edge gap
- [x] Make mobile side drawers full-height and hard-attached to screen edges
- [x] Remove mobile right-drawer inset by scoping stable scrollbar gutter to desktop only
- [x] Replace notes-specific PageLayout className with `variant="notes"`
- [x] Remove Notes variant sidepanel borders and keep hidden scrollbars via shared layout CSS
- [x] Make desktop PageLayout side columns transparent so only panel content surfaces are tinted
- [x] Add fit-width filter toggle variant and use wrap layout for compact filter button groups
- [x] Make selected filter toggles yellow-filled for stronger active state
- [x] Force map grid buttons to render square (not rectangular)
- [x] Align Graph sidebars with shared SidePanel shell/title pattern used in Notes/Map
- [x] Generalize PageLayout panel variant and apply consistent sidebar styling across Notes/Map/Graph
- [x] Add instruction to avoid unnecessary divergence across similar components/screens
- [x] Shrink map cell sizing and typography on smaller devices to reduce scrolling pressure
- [x] Move Todo and Images pages to panel layout variant to remove outer sidebar separator lines
- [x] Add desktop border emphasis on sidebar content shells
- [x] Standardize empty right-panel titles to Preview on Map/Graph when nothing is selected


* Buttons for welcome look smashed together again fix a variant for that or something.
* Right side panel on images have no title, or X button. Nor does left side panel have X button so fix to use correct components
* On desktop we can remove the sidepanel X since there is normally nothing to close
* Create a variant or something for the map or define custom stuff like size or something. It got bigger again for no reason
* Add to instructions to avoid chaning the layout.css it breaks to much when you change global settings
* Placement of the title in sidepanels is really high now on mobile almost difficult to see it.
* add to instructions to never use // eslint-disable-next-line no-restricted-syntax that is a cursee we might be able to extend to allow <div className instead

- [x] Unify dropdown trigger/menu variants to reduce one-off dropdown components
- [x] Consolidate text input components into a typed field API and migrate call sites
- [x] Merge mobile drawer context into PageLayout and update SidePanel hook imports
- [x] Add reusable section header primitives and migrate PagedNotesList wrappers
- [x] Run lint/typecheck on touched files and close refactor checklist

- [x] Rework Dialog API with clearer typed variant options
- [x] Consolidate custom button wrappers toward a single Button prop API
- [x] Make Graph sidebar visibility filters compact and notes-like
- [x] Improve default UI font readability
- [x] Hide default sidepanel close button on desktop widths
- [x] Replace InputField markdown variant with optional markdown flag and remove textarea mode

- [x] Collapse to unified InputField API and remove legacy DetailsField/TextInput wrappers
- [x] Remove freeform InputField class overrides and replace with typed sizing/grow options
- [x] Migrate key NotesCreatePanel/NotesEditorPanel/SettingsPage form inputs to shared primitives
- [x] Wrap mobile page-layout controls in a dedicated component instead of raw wrapper markup
- [x] Prune now-unused settings input-grid CSS after component migration
- [x] Migrate Notes create/editor footer+grid wrappers to shared Stack/Inline/Text primitives
- [x] Remove hidden className usage on file inputs in Notes and Settings flows
- [x] Prune now-unused Notes capture/editor selectors after primitive migration
- [x] Move PageLayout native wrappers to shared typed layout primitives
- [x] Migrate all Ghost/Brass/Icon/FilterToggle wrapper usage to Button-only API
- [x] Remove legacy wrapper exports from Button component module
- [x] Migrate NotesView and NotesPage wrapper div/section usage to shared Stack/Inline primitives
- [x] Migrate AppHeader native wrapper/input markup to shared Stack/Text/InputField primitives
- [x] Add global declaration for __APP_COMMIT_HASH__ and clear AppHeader symbol errors
- [x] Clear final Button formatting diagnostic and re-validate touched files
- [x] Migrate GraphPage native wrapper className usage to shared primitives and typed text variants
- [x] Migrate SidePanel native wrapper className usage to shared Stack/Typography primitives
- [x] Replace remaining PagedNotesList native wrapper class usage with Inline primitive
- [x] Migrate AttachedImagesGallery native wrapper className usage to shared Stack variants
- [x] Remove MarkdownShortcutHelp native wrapper className usage
- [x] Remove MarkdownPreview and MarkdownTokenPreview native wrapper className usage
- [x] Migrate FilterSection and FilterToggleGrid native wrapper className usage to shared primitives
- [x] Replace FilterButtonGroup native wrapper className with Stack variant

- [x] Generalize shared Button/InputField APIs to remove page-specific layout wrappers
- [x] Migrate Welcome, AppHeader, Todo, and Images panels off leftover native wrapper/className usage
- [x] Remove image right-panel preview controls and simplify feedback editor usage
- [x] Fix todo chip row alignment and filter button alignment with shared primitives
- [x] Prune page-specific CSS now covered by shared layout primitives and revalidate

- [x] Restore welcome card spacing, note row title alignment, horizontal chip layout, and left-aligned collapsible filter headers

- [x] Centralize page-layout mobile breakpoint logic behind a shared hook/helper
- [x] Generalize shared media-query helpers and reuse them for theme and popup viewport logic

- [x] Move page-layout mobile/desktop rendering decisions out of CSS and into shared hook-driven React layout

- [x] Fix Notes list edit/preview reopening right panel on mobile repeated interactions
- [x] Fix Notes list delete path robustness for virtual todo-backed rows
- [x] Align Graph visibility filter with shared FilterSection/FilterToggleGrid styles
- [x] Remove graph-specific legacy filter-toggle css override
- [x] Migrate PageLayout primitives and container classes to ui-layout aliases
- [x] Make filter-toggle active style explicit (filled vs outline) and document usage for Graph multi-select filters

## Current UI fixes

- [x] Add dev seed data with generated test images attached to sample notes
- [x] Make image right-panel preview square and constrained
- [x] Make expanded image preview use full dialog width for readability
- [x] Rework todo row layout into title/actions/tags lines and harden long-tag handling

## Current bugfix pass

- [x] Fix markdown shortcut surface readability (non-transparent background)
- [x] Investigate and fix intermittent todo/data loss when local storage is unavailable
- [x] Investigate/fix incorrect image warning and file-system access prompt behavior
- [x] Improve todo row visual polish and interaction affordance

## Current follow-up pass

- [x] Fix mobile image tap opening details panel reliably
- [x] Refactor store backup flow to reduce special-case note/todo logic
- [x] Add storage health indicator in Settings
- [x] Simplify todo row actions into cleaner overflow menu and remove chunky inner row treatment

## Current sync and storage UX pass

- [x] Add sync-folder conflict prompt when both local and folder data exist
- [x] Increase map mobile cell space for better text visibility
- [x] Move image prev/next controls into right-panel title bar actions
- [x] Reorder and clarify storage-related settings copy/status labels
- [x] Add non-invasive image volume advisory when no sync folder is connected

## Current maintainability pass

- [x] Extract browser localStorage safety helpers into shared data module
- [x] Remove duplicated localStorage helper logic from root route bootstrap
- [x] Add shared sync connect conflict-resolution helper in data sync module
- [x] Migrate welcome sync connect flow to shared conflict-resolution helper
- [x] Migrate settings sync connect flow to shared conflict-resolution helper
- [x] Validate touched storage/sync files with typecheck and lint (warnings-only baseline)

## Current UX + sync cleanup pass

- [x] Update todo row overflow menu to use preview/delete icons and grouped status submenu
- [x] Tighten todo row title/menu alignment spacing for cleaner button/title positioning
- [x] Extract shared sync conflict-confirm helper to remove duplicated inline prompt strings
- [x] Extract shared local sync item-count utility and reuse in Welcome + Settings
- [x] Use shared browser storage access helper for Settings storage health backup check

## Current storage-adapter pass

- [x] Add pluggable sync storage adapter interface for snapshot read/import flows
- [x] Implement IndexedDB-backed sync storage adapter as default behavior
- [x] Implement local-backup sync storage adapter for swap-ready fallback behavior
- [x] Route sync write/import through adapter instead of hard-coded db calls

## Current adapter simplification pass

- [x] Rename backend concepts to BrowserDb and LocalDb for clearer naming
- [x] Split backend implementations into dedicated files under src/data/syncStorage
- [x] Keep a single adapter surface with adapter.read and adapter.write
- [x] Move shared merge logic into syncStorage/common helper module

## Current sync runtime rewrite pass

- [x] Rewrite sync runtime state into class-based controller for mode/dirty/last-sync/timers
- [x] Centralize folder picker/open/permission helpers inside runtime class
- [x] Convert LocalDb backend from backup reads to dedicated local-db snapshot key
- [x] Persist and hydrate images in LocalDb backend (no empty image list)