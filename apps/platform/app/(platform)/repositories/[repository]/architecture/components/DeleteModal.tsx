import { memo } from 'react';
import { Button } from "@thinkthroo/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@thinkthroo/ui/components/dialog";

interface DeleteModalProps {
    setDeleteModal: (state: { open: boolean }) => void;
    performDelete: () => Promise<void>;
    pending: boolean;
    deleteModal: { open: boolean };
}

const DeleteModal = ({ setDeleteModal, performDelete, pending, deleteModal }: DeleteModalProps) => {
    return (
        <Dialog open={deleteModal.open} onOpenChange={(open) => { if (!open) setDeleteModal({ open: false }); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-slate-600">Deleting will remove this item and all nested children permanently. This action cannot be undone.</p>
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setDeleteModal({ open: false })}>Cancel</Button>
                        <Button variant="destructive" onClick={() => void performDelete()} disabled={pending}>Delete</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    );
};

export default memo(DeleteModal);