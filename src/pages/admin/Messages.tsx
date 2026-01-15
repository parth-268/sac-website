import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useContactSubmissions,
  useMarkSubmissionRead,
} from "@/hooks/useContactInfo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MessageSquare, Mail, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

const AdminMessages = () => {
  const { data: messages, isLoading } = useContactSubmissions();
  const markRead = useMarkSubmissionRead();
  const [selectedMessage, setSelectedMessage] = useState<
    NonNullable<typeof messages>[number] | null
  >(null);

  const handleViewMessage = async (
    message: NonNullable<typeof messages>[number],
  ) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      try {
        await markRead.mutateAsync(message.id);
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }
  };

  const unreadCount = messages?.filter((m) => !m.is_read).length || 0;

  return (
    <AdminLayout title="Messages">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Contact form submissions ({unreadCount} unread)
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleViewMessage(message)}
              className={`p-4 bg-card rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                message.is_read ? "border-border" : "border-accent"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
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

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
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
