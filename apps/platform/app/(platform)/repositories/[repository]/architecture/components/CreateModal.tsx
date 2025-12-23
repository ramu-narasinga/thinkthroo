import { memo, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
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
    useEffect(() => {
        if (createModal.open) {
            Sentry.logger.info(
                Sentry.logger.fmt`CreateModal opened for ${createModal.type}`,
                { type: createModal.type, timestamp: new Date().toISOString() }
            );
        }
    }, [createModal.open, createModal.type]);
    return (
        <Dialog open={createModal.open} onOpenChange={(open) => {
            if (!open) {
                Sentry.logger.info(
                    Sentry.logger.fmt`CreateModal closed for ${createModal.type}`,
                    { type: createModal.type, timestamp: new Date().toISOString() }
                );
                setCreateModal({ open: false });
            }
        }}>
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
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                Sentry.logger.info(
                                    Sentry.logger.fmt`CreateModal performCreate via Enter for ${createModal.type}`,
                                    { type: createModal.type, value: inputValue, timestamp: new Date().toISOString() }
                                );
                                void performCreate();
                            }
                        }}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => {
                            Sentry.logger.info(
                                Sentry.logger.fmt`CreateModal cancelled for ${createModal.type}`,
                                { type: createModal.type, timestamp: new Date().toISOString() }
                            );
                            setCreateModal({ open: false });
                        }}>Cancel</Button>
                        <Button onClick={() => {
                            Sentry.logger.info(
                                Sentry.logger.fmt`CreateModal performCreate for ${createModal.type}`,
                                { type: createModal.type, value: inputValue, timestamp: new Date().toISOString() }
                            );
                            void performCreate();
                        }} disabled={pending}>Create</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default memo(CreateModal);