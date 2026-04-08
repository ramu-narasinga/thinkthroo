"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@thinkthroo/ui/components/dialog"
import { Button } from "@thinkthroo/ui/components/button"
import { Input } from "@thinkthroo/ui/components/input"
import { toast } from "sonner"
import { inviteClientService } from "@/service/invite"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberModal({ open, onOpenChange }: Props) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!fullName.trim()) {
      toast.error("Full name is required")
      return
    }
    if (!email.trim()) {
      toast.error("Email is required")
      return
    }

    setLoading(true)
    try {
      await inviteClientService.sendInvite({ fullName, email })
      toast.success(`Invite sent to ${email}`)
      setFullName("")
      setEmail("")
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send invite"
      toast.error(message)
      console.error("[InviteMemberModal] sendInvite error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Enter the email address of the person you want to invite. They will receive an
          email with a link to join your team.
        </p>

        <div className="space-y-3 mt-2">
          <Input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending…" : "Send invite"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
