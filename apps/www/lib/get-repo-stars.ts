export async function getRepoStars(repoName: string): Promise<string> {
  const data = await fetch(`https://api.github.com/repos/${repoName}`, {
    next: { revalidate: 86400 },
  })
  const json = await data.json()

  const formattedCount =
    json.stargazers_count >= 1000
      ? json.stargazers_count % 1000 === 0
        ? `${Math.floor(json.stargazers_count / 1000)}k`
        : `${(json.stargazers_count / 1000).toFixed(1)}k`
      : json.stargazers_count?.toLocaleString()

  return formattedCount
}