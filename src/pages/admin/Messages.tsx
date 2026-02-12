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
import { useMemo, useState } from "react";
import { toast } from "sonner";

const AdminMessages = () => {
  const { data: messages, isLoading } = useContactSubmissions();
  const markRead = useMarkSubmissionRead();

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

  const hardDeleteMessages = async (ids: string[]) => {
    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .in("id", ids);

    if (error) throw error;
  };

  const [selectedMessage, setSelectedMessage] = useState<
    NonNullable<typeof messages>[number] | null
  >(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Add local state for activeTab
  const [activeTab, setActiveTab] = useState<"website" | "gmail" | "deleted">(
    "website",
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const ids = currentTabMessages.map((m) => m.id);
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));

      return allSelected ? new Set() : new Set(ids);
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

  const unreadCount =
    messages?.filter((m) => !m.is_read && !m.is_deleted).length || 0;

  const visibleMessages = useMemo(() => {
    if (!messages) return [];
    return messages
      .filter((m) => !m.is_deleted)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [messages]);

  const deletedMessages = useMemo(() => {
    if (!messages) return [];
    return messages
      .filter((m) => m.is_deleted)
      .sort(
        (a, b) =>
          new Date(b.deleted_at ?? b.created_at).getTime() -
          new Date(a.deleted_at ?? a.created_at).getTime(),
      );
  }, [messages]);

  const currentTabMessages =
    activeTab === "deleted" ? deletedMessages : visibleMessages;

  return (
    <AdminLayout title="Messages">
      <Tabs
        value={activeTab}
        className="space-y-6"
        onValueChange={(value) => {
          setActiveTab(value as "website" | "gmail" | "deleted");
          clearSelection();
        }}
      >
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="gmail">Gmail</TabsTrigger>
          <TabsTrigger value="deleted">Deleted</TabsTrigger>
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
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-md border bg-card/95 backdrop-blur shadow-sm px-4 py-2 animate-in fade-in slide-in-from-top-1">
                <input
                  type="checkbox"
                  checked={
                    currentTabMessages.length > 0 &&
                    currentTabMessages.every((m) => selectedIds.has(m.id))
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all messages"
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedIds.size === 0}
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
                    disabled={selectedIds.size === 0}
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
            <div className="flex justify-center items-center py-12 min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : visibleMessages.length > 0 ? (
            <div className="space-y-4">
              {visibleMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleViewMessage(message)}
                  className={`group p-4 bg-card rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${message.is_read ? "border-border" : "border-accent"}`}
                  role="button"
                  aria-selected={selectedIds.has(message.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleViewMessage(message);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(message.id)}
                        onChange={() => toggleSelect(message.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
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
                              clearSelection();
                              toast("Message deleted", {
                                action: {
                                  label: "Undo",
                                  onClick: async () => {
                                    try {
                                      await restoreMessages([message.id]);
                                      clearSelection();
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
            <div className="text-center py-16 bg-card rounded-lg border border-border shadow-sm">
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
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-border text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Gmail Integration Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              We’re working on securely integrating the official SAC Gmail
              inbox. This feature will be enabled in a future update once all
              security and compliance checks are completed.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="deleted" className="space-y-6" key="deleted-tab">
          {selectedIds.size > 0 && (
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-md border bg-card/95 backdrop-blur shadow-sm px-4 py-2 animate-in fade-in slide-in-from-top-1">
              <input
                type="checkbox"
                checked={
                  deletedMessages.length > 0 &&
                  deletedMessages.every((m) => selectedIds.has(m.id))
                }
                onChange={toggleSelectAll}
                aria-label="Select all deleted messages"
                className="h-4 w-4 rounded border-border text-destructive focus:ring-destructive"
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.size === 0}
                  onClick={async () => {
                    try {
                      await restoreMessages(Array.from(selectedIds));
                      clearSelection();
                      toast.success("Messages restored");
                    } catch {
                      toast.error("Failed to restore messages");
                    }
                  }}
                >
                  Restore
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedIds.size === 0}
                  onClick={async () => {
                    if (
                      !confirm(
                        "This action cannot be undone. Delete permanently?",
                      )
                    )
                      return;
                    const ids = Array.from(selectedIds);
                    try {
                      await hardDeleteMessages(ids);
                      clearSelection();
                      toast.success("Messages permanently deleted");
                    } catch {
                      toast.error("Failed to delete permanently");
                    }
                  }}
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Deleted messages are retained until permanently removed.
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center py-12 min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : deletedMessages.length > 0 ? (
            <div className="space-y-4">
              {deletedMessages.map((message) => (
                <div
                  key={message.id}
                  className="group p-4 bg-card rounded-lg border border-destructive/40 transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(message.id)}
                      onChange={() => toggleSelect(message.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 rounded border-border text-destructive focus:ring-destructive"
                      aria-label="Select deleted message"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {message.subject}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {message.name} • {message.email}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {message.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Deleted on{" "}
                        {message.deleted_at
                          ? format(new Date(message.deleted_at), "MMM d, yyyy")
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border border-border shadow-sm">
              <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No deleted messages
              </h3>
              <p className="text-muted-foreground">
                Deleted messages will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => {
          setSelectedMessage(null);
        }}
      >
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
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
              <div className="pt-4 border-t border-border max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1">
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <Button
                variant="default"
                className="w-full mt-2"
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
