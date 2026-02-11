import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useContactSubmissions,
  useMarkSubmissionRead,
} from "@/hooks/useContactInfo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  MessageSquare,
  Mail,
  CheckCircle,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type GmailMessage = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
};

const AdminMessages = () => {
  const { data: messages, isLoading } = useContactSubmissions();
  const markRead = useMarkSubmissionRead();

  const [gmailMessages, setGmailMessages] = useState<GmailMessage[] | null>(
    null,
  );
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  const fetchGmailMessages = async () => {
    try {
      setGmailLoading(true);
      setGmailError(null);

      const res = await fetch(
        "https://pgggsaplngmehtjcdeku.supabase.co/functions/v1/gmail-inbox",
      );

      if (!res.ok) throw new Error("Failed to fetch Gmail inbox");

      const data = await res.json();
      setGmailMessages(data.messages || []);
    } catch (err) {
      setGmailError("Gmail not connected");
      setGmailMessages(null);
    } finally {
      setGmailLoading(false);
    }
  };

  const deleteMessages = async (ids: string[]) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) throw error;
  };

  const markUnreadMessages = async (ids: string[]) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: false })
      .in("id", ids);

    if (error) throw error;
  };

  const restoreMessages = async (ids: string[]) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({
        is_deleted: false,
        deleted_at: null,
      })
      .in("id", ids);

    if (error) throw error;
  };

  const [selectedMessage, setSelectedMessage] = useState<
    NonNullable<typeof messages>[number] | null
  >(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleViewMessage = async (
    message: NonNullable<typeof messages>[number],
  ) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      try {
        await markRead.mutateAsync({ id: message.id });
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }
  };

  const unreadCount = messages?.filter((m) => !m.is_read).length || 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "connected") {
      fetchGmailMessages();
      params.delete("gmail");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <AdminLayout title="Messages">
      <Tabs
        defaultValue="website"
        className="space-y-6"
        onValueChange={(v) => {
          if (v === "gmail" && !gmailMessages) fetchGmailMessages();
        }}
      >
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="gmail">Gmail</TabsTrigger>
        </TabsList>

        {/* WEBSITE TAB */}
        <TabsContent value="website" className="space-y-6">
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Contact form submissions ({unreadCount} unread)
              </p>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between rounded-md border bg-background px-4 py-2">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await markUnreadMessages(Array.from(selectedIds));
                        clearSelection();
                        toast.success("Marked as unread");
                      } catch {
                        toast.error("Failed to update messages");
                      }
                    }}
                  >
                    Mark Unread
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSelection()}
                  >
                    Clear
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const ids = Array.from(selectedIds);
                      try {
                        await deleteMessages(ids);
                        clearSelection();

                        toast("Messages deleted", {
                          action: {
                            label: "Undo",
                            onClick: async () => {
                              try {
                                await restoreMessages(ids);
                                toast.success("Messages restored");
                              } catch {
                                toast.error("Failed to restore");
                              }
                            },
                          },
                        });
                      } catch {
                        toast.error("Failed to delete messages");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : messages && messages.filter((m) => !m.is_deleted).length > 0 ? (
            <div className="space-y-4">
              {messages
                .filter((message) => !message.is_deleted)
                .map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleViewMessage(message)}
                    className={`p-4 bg-card rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-[1.005] ${
                      message.is_read ? "border-border" : "border-accent"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(message.id)}
                          onChange={() => toggleSelect(message.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                          aria-label="Select message"
                        />
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            message.is_read ? "bg-secondary" : "bg-accent/10"
                          }`}
                        >
                          <Mail
                            className={`h-5 w-5 ${
                              message.is_read
                                ? "text-muted-foreground"
                                : "text-accent"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {message.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {message.email}
                          </p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                          {message.is_read && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await markUnreadMessages([message.id]);
                                  toast.success("Marked as unread");
                                } catch {
                                  toast.error("Failed to update message");
                                }
                              }}
                              aria-label="Mark as unread"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await deleteMessages([message.id]);
                                toast("Message deleted", {
                                  action: {
                                    label: "Undo",
                                    onClick: async () => {
                                      try {
                                        await restoreMessages([message.id]);
                                        toast.success("Message restored");
                                      } catch {
                                        toast.error("Failed to restore");
                                      }
                                    },
                                  },
                                });
                              } catch {
                                toast.error("Failed to delete message");
                              }
                            }}
                            aria-label="Delete message"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "MMM d, yyyy")}
                        </span>

                        {message.is_read && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No messages yet
              </h3>
              <p className="text-muted-foreground">
                Contact form submissions will appear here
              </p>
            </div>
          )}
        </TabsContent>

        {/* GMAIL TAB */}
        <TabsContent value="gmail" className="space-y-6">
          {!gmailMessages && !gmailLoading && (
            <div className="text-center py-16 bg-card rounded-lg border border-border">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Connect SAC Gmail
              </h3>
              <p className="text-muted-foreground mb-6">
                View unread messages from the official SAC Gmail inbox.
              </p>
              <Button
                onClick={async () => {
                  const res = await fetch(
                    "https://pgggsaplngmehtjcdeku.supabase.co/functions/v1/gmail-auth-url",
                  );
                  const data = await res.json();
                  window.location.href = data.url;
                }}
              >
                Connect Gmail
              </Button>
            </div>
          )}

          {gmailLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}

          {gmailMessages && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  Gmail Inbox ({gmailMessages.length} unread)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchGmailMessages}
                >
                  Refresh
                </Button>
              </div>

              {gmailMessages.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No unread Gmail messages
                  </p>
                </div>
              ) : (
                gmailMessages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() =>
                      window.open(
                        `https://mail.google.com/mail/u/0/#inbox/${m.threadId}`,
                        "_blank",
                      )
                    }
                    className="p-4 bg-card rounded-lg border cursor-pointer transition hover:shadow-md"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-foreground">{m.from}</p>
                        <p className="text-sm font-semibold">{m.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {m.snippet}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {m.date}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {gmailError && (
            <p className="text-sm text-destructive text-center">{gmailError}</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => {
          setSelectedMessage(null);
          clearSelection();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">From:</span>
                <span className="text-foreground">
                  {selectedMessage.name} ({selectedMessage.email})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">
                  {format(
                    new Date(selectedMessage.created_at),
                    "MMMM d, yyyy 'at' h:mm a",
                  )}
                </span>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMessages;
