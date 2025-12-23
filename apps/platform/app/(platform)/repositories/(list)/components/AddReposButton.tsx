"use client";
import { Button } from "@thinkthroo/ui/components/button";

export function AddReposButton() {
  const handleClick = () => {
    if (typeof window !== "undefined" && typeof window.umami === "function") {
      window.umami("add_repositories_click");
    }
    const githubAppName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME; // replace with your actual GitHub App slug
    const url = `https://github.com/apps/${githubAppName}/installations/new`;
    window.location.href = url; // trigger redirect to GitHub install
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 cursor-pointer"
    >
      + Add Repositories
    </Button>
  );
}
