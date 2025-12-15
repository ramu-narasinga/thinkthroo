// helpers/server.ts
"use server";

export async function subscribeToNewsLetter(
  formData: FormData
): Promise<string> {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  // Prepare the payload for the Listmonk subscription request
  const payload = {
    email,
    name,
    status: "enabled",
    lists: [1], // Adjust the list ID as needed
    attribs: {
      city: "Bengaluru", // Optionally include other fields as needed
      projects: 3,
      stack: { languages: ["go", "python"] }, // Adjust based on your needs
    },
  };

  try {
    // Make the POST request to Listmonk API
    const response = await fetch(process.env.LISTMONK_URL as string, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          btoa(
            `${process.env.LISTMONK_USERNAME}:${process.env.LISTMONK_PASSWORD}`
          ),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return `Error: ${data.message || response.statusText}`;
    }

    return `Subscribed successfully: ${data.data.email}`;
  } catch (error) {
    const errMsg = (error as Error).message || "Unknown error occurred";
    console.error("Subscription failed:", error);
    return `Error: ${errMsg}`;
  }
}
