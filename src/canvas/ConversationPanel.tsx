import { useEffect, useState, type KeyboardEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"

import type { ConversationMessage, NarrativeNode } from "@/canvas/types"

type ConversationPanelProps = {
  node: NarrativeNode
  messages: ConversationMessage[]
  draft: string
  onDraftChange: (draft: string) => void
  onSend: () => void
}

export function ConversationPanel({
  node,
  messages,
  draft,
  onDraftChange,
  onSend,
}: ConversationPanelProps) {
  const [loadedNodeId, setLoadedNodeId] = useState<string | null>(null)
  const isLoading = loadedNodeId !== node.id

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoadedNodeId(node.id), 250)
    return () => window.clearTimeout(timeout)
  }, [node.id])

  function onDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  const visibleMessages = messages.length > 0 ? messages : [{ id: "summary", author: "assistant" as const, text: node.data.summary }]

  return (
    <Sidebar
      aria-label="Conversation panel"
      className="p-2! **:data-[slot=sidebar-inner]:overflow-hidden **:data-[slot=sidebar-inner]:rounded-[24px]"
      collapsible="offcanvas"
      role="complementary"
      side="left"
      variant="floating"
    >
      <SidebarHeader className="border-b bg-muted/50 px-4 py-4">
        <header className="flex min-h-24 flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{node.data.title}</h1>
          <p className="text-sm text-muted-foreground">{node.id}</p>
          <div className="flex flex-wrap gap-2" aria-label="Conversation tags">
            <Badge variant="secondary">Node only</Badge>
            <Badge variant="secondary">No branch context</Badge>
            <Badge variant="secondary">Local draft</Badge>
          </div>
        </header>
      </SidebarHeader>

      <SidebarContent className="p-4" aria-busy={isLoading} aria-live="polite">
        {isLoading ? (
          <div aria-label="Loading conversation" className="flex flex-1 flex-col gap-4 pb-4">
            <Skeleton className="h-16 max-w-[67%] rounded-2xl" />
            <Skeleton className="ml-auto h-16 w-[59%] rounded-2xl" />
            <Skeleton className="h-16 w-[64%] rounded-2xl" />
            <Skeleton className="ml-auto h-16 max-w-[67%] rounded-2xl" />
            <Skeleton className="h-16 w-[56%] rounded-2xl" />
          </div>
        ) : (
          <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className="flex-1">
              <MessageScrollerViewport aria-label="Conversation messages">
                <MessageScrollerContent className="gap-4 pb-4">
                  {visibleMessages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.author === "user"}
                    >
                      <Message align={message.author === "user" ? "end" : "start"}>
                        <MessageContent>
                          <Bubble
                            align={message.author === "user" ? "end" : "start"}
                            className="max-w-[67%]"
                            variant={message.author === "user" ? "default" : "secondary"}
                          >
                            <BubbleContent className="border-border px-4 py-3">{message.text}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="mt-auto flex h-16 items-center gap-2 rounded-2xl border bg-background px-3 shadow-sm" aria-label="Message composer">
          <label className="sr-only" htmlFor="message-draft">
            Message draft
          </label>
          <Textarea
            className="h-10 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            id="message-draft"
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onDraftKeyDown}
            placeholder="Write a local message"
            rows={1}
            value={draft}
          />
          <Button
            className="cursor-not-allowed rounded-full"
            size="icon"
            variant="secondary"
            aria-label="Upload images (placeholder)"
            aria-disabled="true"
            title="Image upload will be added later"
          >
            <i className="fa-solid fa-paperclip text-sm" aria-hidden="true" />
          </Button>
          <Button
            className="rounded-full"
            size="icon"
            variant="default"
            aria-label="Send message"
            disabled={!draft.trim()}
            onClick={onSend}
            title="Send local message"
          >
            <i className="fa-regular fa-paper-plane text-sm" aria-hidden="true" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
