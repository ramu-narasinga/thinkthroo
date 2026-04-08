export function ArchitectureStorageGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Free */}
      <div className="rounded-lg border border-border p-4 space-y-1">
        <p className="font-medium text-sm">Free</p>
        <p className="text-2xl font-bold">
          1{" "}
          <span className="text-base font-normal text-muted-foreground">public repository</span>
        </p>
        <p className="text-sm font-semibold">25 MB</p>
        <p className="text-xs text-muted-foreground">
          Architecture rules storage per repository. No RAG review runs.
        </p>
      </div>

      {/* Pro */}
      <div className="rounded-lg border-2 border-[#7000FF] p-4 space-y-1">
        <p className="font-medium text-sm text-[#7000FF]">Pro</p>
        <p className="text-2xl font-bold">
          Unlimited{" "}
          <span className="text-base font-normal text-muted-foreground">repositories</span>
        </p>
        <p className="text-sm font-semibold">250 MB</p>
        <p className="text-xs text-muted-foreground">
          Architecture rules storage per repository. RAG runs on every PR.
        </p>
      </div>
    </div>
  )
}
