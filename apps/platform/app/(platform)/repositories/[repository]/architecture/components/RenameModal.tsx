import { Button } from "@thinkthroo/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@thinkthroo/ui/components/dialog";
import { Input } from "@thinkthroo/ui/components/input";


interface RenameModalProps {
    setRenameModal: (state: { open: boolean }) => void;
    performRename: () => Promise<void>;
    pending: boolean;
    inputValue: string;
    setInputValue: (value: string) => void;
    renameModal: { open: boolean };
}

export default function RenameModal({ setRenameModal, performRename, pending, inputValue, setInputValue, renameModal }: RenameModalProps) {
    return <Dialog open={renameModal.open} onOpenChange={(open) => { if (!open) setRenameModal({ open: false }); }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rename</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
                <Input
                    aria-label="New name"
                    placeholder="Enter new name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void performRename(); }}
                />
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setRenameModal({ open: false })}>Cancel</Button>
                    <Button onClick={() => void performRename()} disabled={pending}>Save</Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
}