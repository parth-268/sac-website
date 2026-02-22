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
import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const AdminMessages = () => {
  const { data: websiteMessages, isLoading: websiteLoading } =
    useContactSubmissions("all");
  const { data: deletedMessagesData, isLoading: deletedLoading } =
    useContactSubmissions("deleted");
  const markRead = useMarkSubmissionRead();
  const queryClient = useQueryClient();

  const deleteMessages = async (ids: string[]) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) throw error;

    await queryClient.invalidateQueries({
      queryKey: ["contact-submissions"],
    });
  };

  const markUnreadMessages = async (ids: string[]) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: false })
      .in("id", ids);

    if (error) throw error;

    await queryClient.invalidateQueries({
      queryKey: ["contact-submissions"],
    });
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

    await queryClient.invalidateQueries({
      queryKey: ["contact-submissions"],
    });
  };

  const hardDeleteMessages = async (ids: string[]) => {
    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .in("id", ids);

    if (error) throw error;

    await queryClient.invalidateQueries({
      queryKey: ["contact-submissions"],
    });
  };

  const [selectedMessage, setSelectedMessage] = useState<
    NonNullable<typeof websiteMessages>[number] | null
  >(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Add local state for activeTab
  const [activeTab, setActiveTab] = useState<"website" | "gmail" | "deleted">(
    "website",
  );

  // --- New state derived from websiteMessages and deletedMessagesData
  const unreadCount = websiteMessages?.filter((m) => !m.is_read).length || 0;

  const visibleMessages = websiteMessages ?? [];
  const deletedMessages = deletedMessagesData ?? [];

  const isLoading = activeTab === "deleted" ? deletedLoading : websiteLoading;

  const currentTabMessages =
    activeTab === "deleted" ? deletedMessages : visibleMessages;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const ids = currentTabMessages.map((m) => m.id);
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));

      return allSelected ? new Set() : new Set(ids);
    });
  }, [currentTabMessages]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleViewMessage = async (
    message: NonNullable<typeof websiteMessages>[number],
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
              <div className="sticky top-0 z-10 flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-md border bg-card/95 backdrop-blur shadow-md px-4 py-2 animate-in fade-in slide-in-from-top-1">
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
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  {/* Order: Mark Unread → Clear → Delete */}
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
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("input,button,svg"))
                      return;
                    handleViewMessage(message);
                  }}
                  className={`group p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    message.is_read
                      ? "bg-card border-border"
                      : "bg-accent/5 border-accent"
                  }`}
                  role="button"
                  aria-selected={selectedIds.has(message.id)}
                  aria-pressed={selectedIds.has(message.id)}
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
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-foreground text-base ${
                              !message.is_read ? "" : ""
                            }`}
                          >
                            {message.subject}
                          </span>
                          {!message.is_read && (
                            <span
                              className="ml-1 flex-shrink-0 w-2 h-2 rounded-full bg-accent"
                              title="Unread"
                            />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-xs text-muted-foreground font-medium">
                            {message.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.email}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground mt-1 line-clamp-2 font-normal">
                          {message.message}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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

        <TabsContent value="deleted" className="space-y-6">
          {selectedIds.size > 0 && (
            <div className="sticky top-0 z-10 flex items-center gap-3 flex-wrap sm:flex-nowrap rounded-md border bg-muted/80 border-destructive/40 backdrop-blur shadow-md px-4 py-2 animate-in fade-in slide-in-from-top-1">
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
              <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
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
                  className="group p-4 rounded-lg border border-destructive/40 transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive bg-muted/60 border-dashed"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {message.subject}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/30 ml-1">
                          Deleted
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          {message.name}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {message.email}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground line-clamp-2 mt-1 font-normal">
                        {message.message}
                      </span>
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
        onOpenChange={(open) => {
          if (!open) setSelectedMessage(null);
        }}
      >
        <DialogContent className="max-w-xl w-full max-h-[90vh] p-0 flex flex-col rounded-lg sm:rounded-lg">
          {selectedMessage && (
            <>
              {/* Header */}
              <DialogHeader className="px-5 pt-5 pb-3 border-b">
                <DialogTitle className="text-base sm:text-lg leading-tight">
                  {selectedMessage.subject}
                </DialogTitle>
              </DialogHeader>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Sender info */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {selectedMessage.name}
                  </p>
                  <p className="text-xs text-muted-foreground break-all">
                    {selectedMessage.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(selectedMessage.created_at),
                      "MMMM d, yyyy • h:mm a",
                    )}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-foreground">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="border-t px-5 py-3 bg-background/95 backdrop-blur rounded-md">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!selectedMessage.email) {
                      toast.error("No email address available");
                      return;
                    }
                    window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reply via Email
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMessages;
