"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@thinkthroo/ui/components/dialog"
import { Button } from "@thinkthroo/ui/components/button"
import { Label } from "@thinkthroo/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thinkthroo/ui/components/select"
import { Switch } from "@thinkthroo/ui/components/switch"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { organizationSettingsClientService } from "@/service/organizationSettings/client"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string | undefined
}

const DEFAULTS = {
  defaultRole: "Member",
  allowMemberInvites: false,
  requireApproval: true,
}

export function MembersSettingsModal({ open, onOpenChange, organizationId }: Props) {
  const [defaultRole, setDefaultRole] = useState(DEFAULTS.defaultRole)
  const [allowMemberInvites, setAllowMemberInvites] = useState(DEFAULTS.allowMemberInvites)
  const [requireApproval, setRequireApproval] = useState(DEFAULTS.requireApproval)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reset to defaults when modal closes so stale state never flashes
  useEffect(() => {
    if (!open) {
      setDefaultRole(DEFAULTS.defaultRole)
      setAllowMemberInvites(DEFAULTS.allowMemberInvites)
      setRequireApproval(DEFAULTS.requireApproval)
    }
  }, [open])

  // Load persisted settings whenever the modal opens
  useEffect(() => {
    if (!open || !organizationId) return

    setLoading(true)
    organizationSettingsClientService
      .getByOrganization(organizationId)
      .then((settings) => {
        if (!settings) return
        setDefaultRole(settings.memberDefaultRole ?? DEFAULTS.defaultRole)
        setAllowMemberInvites(settings.allowMemberInvites ?? DEFAULTS.allowMemberInvites)
        setRequireApproval(settings.requireMemberApproval ?? DEFAULTS.requireApproval)
      })
      .catch(() => toast.error("Failed to load member settings"))
      .finally(() => setLoading(false))
  }, [open, organizationId])

  async function handleSave() {
    if (!organizationId) {
      toast.error("No active organization")
      return
    }
    setSaving(true)
    try {
      await organizationSettingsClientService.upsert(organizationId, {
        memberDefaultRole: defaultRole,
        allowMemberInvites,
        requireMemberApproval: requireApproval,
      })
      toast.success("Member settings saved")
      onOpenChange(false)
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const disabled = loading || saving

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Member Settings</DialogTitle>
          <DialogDescription>
            Configure default behaviour for team members.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {/* Default role */}
            <div className="space-y-1.5">
              <Label htmlFor="default-role">Default role for new members</Label>
              <Select value={defaultRole} onValueChange={setDefaultRole} disabled={disabled}>
                <SelectTrigger id="default-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allow member invites */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Allow members to invite others</Label>
                <p className="text-xs text-muted-foreground">
                  Members (not just Admins) can send invitations.
                </p>
              </div>
              <Switch
                checked={allowMemberInvites}
                onCheckedChange={setAllowMemberInvites}
                disabled={disabled}
              />
            </div>

            {/* Require approval */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Require admin approval for new members</Label>
                <p className="text-xs text-muted-foreground">
                  Invited users must be approved before they gain access.
                </p>
              </div>
              <Switch
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={disabled}>
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
