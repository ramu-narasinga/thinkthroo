"use client"

import { useState } from "react"
import { Button } from "@thinkthroo/ui/components/button"

type Props = {
  open: boolean
  onClose: () => void
}

export default function DeleteOrganizationModal({ open, onClose }: Props) {
  const [confirmText, setConfirmText] = useState("")

  if (!open) return null

  const canDelete = confirmText === "delete"

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background w-[420px] rounded-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-3">
          Are you sure you want to delete your organization?
        </h2>

        <p className="text-sm text-muted-foreground mb-3">
          This action <b>cannot</b> be undone. This will immediately delete
          the organization and all stored data.
        </p>

        <p className="text-sm text-red-600 mb-4">
          Your AI reviews will stop working after this action.
        </p>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder='Type "delete"'
          className="w-full border px-3 py-2 rounded-md mb-2"
        />

        <p className="text-xs text-muted-foreground mb-4">
          To confirm, type <b>delete</b> above.
        </p>

        <button
  type="button"
  disabled={!canDelete}
  onClick={() => {
    alert("DELETE CLICKED")
    onClose()
  }}
  className={`w-full py-2 rounded-md text-white font-medium
    ${canDelete
      ? "bg-red-600 hover:bg-red-700"
      : "bg-red-400 cursor-not-allowed"}
  `}
>
  Delete Organization
</button>




      </div>
    </div>
  )
}
