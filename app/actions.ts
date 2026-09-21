"use server"

import { redirect } from "next/navigation"

import { parseHash } from "@/lib/hash"

export async function readHash(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const hash = parseHash(formData.get("hash"))
  if (!hash) return "That is not a transaction hash."
  redirect(`/tx/${hash}`)
}
