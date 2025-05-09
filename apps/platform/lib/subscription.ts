import { createClient } from "@/utils/supabase/server"

export async function getUserSubscription(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("customer_id", userId)
    .eq("subscription_status", "active") // Adjust status logic as needed
    .maybeSingle()

  return data // returns null if no active sub
}
