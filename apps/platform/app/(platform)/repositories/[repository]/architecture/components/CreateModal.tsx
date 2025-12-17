import { memo } from 'react';
import { Button } from "@thinkthroo/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@thinkthroo/ui/components/dialog";
import { Input } from "@thinkthroo/ui/components/input";

interface CreateModalProps {
    setCreateModal: (state: { open: boolean }) => void;
    performCreate: () => Promise<void>;
    pending: boolean;
    inputValue: string;
    setInputValue: (value: string) => void;
    createModal: { open: boolean, type: "file" | "folder" };
}

const CreateModal = ({ setCreateModal, pending, inputValue, setInputValue, createModal, performCreate }: CreateModalProps) => {
    return (
        <Dialog open={createModal.open} onOpenChange={(open) => { if (!open) setCreateModal({ open: false }); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{createModal.type === "file" ? "New File" : "New Folder"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                    <Input
                        aria-label="Name"
                        placeholder={createModal.type === "file" ? "file-name.md" : "Folder name"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void performCreate(); }}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setCreateModal({ open: false })}>Cancel</Button>
                        <Button onClick={() => void performCreate()} disabled={pending}>Create</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default memo(CreateModal);