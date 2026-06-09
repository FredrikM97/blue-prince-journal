export function buildCapturePanelKey({
  captureDefault,
  capturePrefill,
  captureEditNoteId,
  captureEditTodoId,
  modeOverride,
}: {
  captureDefault: "note" | "todo";
  capturePrefill: string;
  captureEditNoteId?: string;
  captureEditTodoId?: string;
  modeOverride?: "note" | "todo";
}) {
  let panelKey = `capture:new:${modeOverride ?? captureDefault}:${capturePrefill}`;
  if (captureEditNoteId) {
    panelKey = `capture:edit-note:${captureEditNoteId}`;
  }
  if (captureEditTodoId) {
    panelKey = `capture:edit-todo:${captureEditTodoId}`;
  }
  return panelKey;
}
