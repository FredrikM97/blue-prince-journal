import { Link } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  DownloadCloud,
  UploadCloud,
  Coffee,
  Github,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";
import { exportAll, importAll } from "@/data/storage/backup";
import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/menu/DropdownMenu";

export function HeaderMenu() {
  const buyMeACoffeeUrl = "https://buymeacoffee.com/fredrikm97";
  const githubUrl = "https://github.com/FredrikM97/blue-prince-journal";
  const fileRef = useRef<HTMLInputElement>(null);
  const [localFirstInfoOpen, setLocalFirstInfoOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Settings">
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => exportAll().then(() => toast.success("Exported"))}>
            <DownloadCloud className="mr-1 h-4 w-4 text-sky-500" /> Export all (ZIP)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
            <UploadCloud className="mr-1 h-4 w-4 text-emerald-500" /> Import…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={githubUrl} target="_blank" rel="noreferrer">
              <Github className="mr-1 h-4 w-4 text-foreground" /> GitHub
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLocalFirstInfoOpen(true)}>
            <ShieldCheck className="mr-1 h-4 w-4 text-amber-500" /> Local-first privacy
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={buyMeACoffeeUrl} target="_blank" rel="noreferrer">
              <Coffee className="mr-1 h-4 w-4 text-orange-500" /> Buy me a coffee
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <SlidersHorizontal className="mr-1 h-4 w-4 text-violet-500" /> Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileRef}
        type="file"
        accept=".zip,application/zip,application/json,.json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            await importAll(f, "merge");
            toast.success("Imported");
          } catch (err) {
            toast.error((err as Error).message);
          }
          e.target.value = "";
        }}
      />
      <Dialog open={localFirstInfoOpen} onOpenChange={setLocalFirstInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Local-first privacy</DialogTitle>
            <DialogDescription>
              Blue Prince Journal stores your notes, todos, rooms, and images locally in your
              browser by default.
            </DialogDescription>
          </DialogHeader>
          <DialogDescription>
            No account is required, and your data is not uploaded unless you explicitly export,
            import, or connect a local sync folder.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
