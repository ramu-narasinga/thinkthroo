import { memo, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
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
    useEffect(() => {
        if (deleteModal.open) {
            Sentry.logger.info(
                Sentry.logger.fmt`DeleteModal opened`,
                { timestamp: new Date().toISOString() }
            );
        }
    }, [deleteModal.open]);
    return (
        <Dialog open={deleteModal.open} onOpenChange={(open) => {
            if (!open) {
                Sentry.logger.info(
                    Sentry.logger.fmt`DeleteModal closed`,
                    { timestamp: new Date().toISOString() }
                );
                setDeleteModal({ open: false });
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-slate-600">Deleting will remove this item and all nested children permanently. This action cannot be undone.</p>
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => {
                            Sentry.logger.info(
                                Sentry.logger.fmt`DeleteModal cancelled`,
                                { timestamp: new Date().toISOString() }
                            );
                            setDeleteModal({ open: false });
                        }}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                            Sentry.logger.info(
                                Sentry.logger.fmt`DeleteModal performDelete`,
                                { timestamp: new Date().toISOString() }
                            );
                            void performDelete();
                        }} disabled={pending}>Delete</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default memo(DeleteModal);