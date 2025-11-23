"use client"

import React from "react"
import { toaster } from "@/components/ui/toaster"
import { useUsers } from "@/modules/admin/hooks/useUser"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { aiApi } from "@/api/ai.api"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  at: number
}

type SummarySource = "users" | "states" | "districts" | "regions" | "groups" | "oldGroups"

const cache = new Map<string, { summary: string; at: number }>()

const ttlMs = 5 * 60 * 1000

const pickSample = <T,>(arr: T[], n = 25): T[] => arr.slice(0, Math.max(0, Math.min(n, arr.length)))

const toJson = (obj: unknown): string => {
  try {
    return JSON.stringify(obj)
  } catch {
    return "{}"
  }
}

const now = (): number => Date.now()

const label: Record<SummarySource, string> = {
  users: "Users",
  states: "States",
  regions: "Regions",
  districts: "Districts",
  groups: "Groups",
  oldGroups: "Old Groups",
}

const AIChatWidget: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [loading, setLoading] = React.useState(false)

  const { data: users = [] } = useUsers()
  const { states = [] } = useStates()
  const { regions = [] } = useRegions()
  const { districts = [] } = useDistricts()
  const { groups = [] } = useGroups()
  const { oldGroups = [] } = useOldGroups()

  const getData = React.useCallback((src: SummarySource): unknown[] => {
    switch (src) {
      case "users":
        return users
      case "states":
        return states
      case "regions":
        return regions
      case "districts":
        return districts
      case "groups":
        return groups
      case "oldGroups":
        return oldGroups
      default:
        return []
    }
  }, [users, states, regions, districts, groups, oldGroups])

  const push = React.useCallback((role: ChatRole, content: string) => {
    setMessages((prev) => [...prev, { id: Math.random().toString(36).slice(2), role, content, at: now() }])
  }, [])

  const summarizeLocally = (src: SummarySource, data: unknown[]): string => {
    const count = data.length
    const sample = pickSample(data, 10)
    const fields = sample.length > 0 && typeof sample[0] === "object" && sample[0] !== null ? Object.keys(sample[0] as Record<string, unknown>) : []
    return `Summary of ${label[src]}\nTotal: ${count}\nFields: ${fields.join(", ")}\nSample: ${toJson(sample)}`
  }

  const summarizeWithAI = async (src: SummarySource, data: unknown[]): Promise<string> => {
    const key = `${src}`
    const cached = cache.get(key)
    if (cached && now() - cached.at < ttlMs) return cached.summary

    const payload = {
      source: src,
      rows: pickSample(data, 50),
      meta: { total: data.length },
    }

    try {
      const aiSummary = await aiApi.summarize(payload)
      const summary = aiSummary || summarizeLocally(src, data)
      cache.set(key, { summary, at: now() })
      return summary
    } catch (e: unknown) {
      const err = e as { message?: unknown }
      const msg = typeof err?.message === "string" ? err.message : "Failed to get AI summary"
      toaster.error({description:msg})
      const fallback = summarizeLocally(src, data)
      cache.set(key, { summary: fallback, at: now() })
      return fallback
    }
  }

  const handleSummarize = async (src: SummarySource) => {
    const data = getData(src)
    if (!data || data.length === 0) {
      toaster.create({ description: "No data available", type: "warning", closable: true })
      return
    }
    setLoading(true)
    push("user", `Summarize ${label[src]}`)
    const summary = await summarizeWithAI(src, data)
    push("assistant", summary)
    setLoading(false)
  }

  const handleSend = () => {
    if (!input.trim()) return
    push("user", input.trim())
    setInput("")
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {!open && (
        <button aria-label="Open AI chat" onClick={() => setOpen(true)}>AI</button>
      )}

      {open && (
        <div style={{ width: 384, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 12, padding: 16, background: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>AI Assistant</strong>
            <button aria-label="Close" onClick={() => setOpen(false)}>×</button>
          </div>
          <div style={{ margin: "12px 0", borderTop: "1px solid #eee" }} />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => handleSummarize("users")}>Users</button>
            <button onClick={() => handleSummarize("states")}>States</button>
            <button onClick={() => handleSummarize("regions")}>Regions</button>
            <button onClick={() => handleSummarize("districts")}>Districts</button>
            <button onClick={() => handleSummarize("groups")}>Groups</button>
            <button onClick={() => handleSummarize("oldGroups")}>Old Groups</button>
          </div>

          <div style={{ height: 224, border: "1px solid #eee", borderRadius: 8, overflowY: "auto", marginTop: 12, padding: 12 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.role === "assistant" ? "flex-start" : "flex-end" }}>
                <div style={{ background: m.role === "assistant" ? "#f3f6fb" : "#f8f9fc", padding: 8, borderRadius: 8, maxWidth: 288, whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ fontSize: 12 }}>Working…</div>}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" />
            <button aria-label="Send" onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIChatWidget