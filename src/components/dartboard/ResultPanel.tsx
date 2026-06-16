import { roundNice } from "./compute";

type Props = {
  result: number | null;
  error?: string;
};

export function ResultPanel({ result, error }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        Result
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <div
          className="font-serif text-5xl font-bold"
          style={{ textShadow: "0 0 24px rgba(255,255,255,0.15)" }}
        >
          {result === null ? "—" : roundNice(result)}
        </div>
      )}
    </div>
  );
}
