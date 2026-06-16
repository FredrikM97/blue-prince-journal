import { Link } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Coffee,
  MessageSquareText,
} from "lucide-react";
import { useRef, useState } from "react";
import { exportAll, importAll } from "@/data/storage/backup";
import {
  FeedbackDialog,
} from "@/components/app-header/FeedbackDialog";
import { Button } from "@/components/common/Button";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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
            <Download className="mr-1 h-4 w-4" /> Export all (ZIP)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-4 w-4" /> Import…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setFeedbackOpen(true)}>
            <MessageSquareText className="mr-1 h-4 w-4" /> Send feedback
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={buyMeACoffeeUrl} target="_blank" rel="noreferrer">
              <Coffee className="mr-1 h-4 w-4" /> Buy me a coffee
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <SettingsIcon className="mr-1 h-4 w-4" /> Settings
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
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
