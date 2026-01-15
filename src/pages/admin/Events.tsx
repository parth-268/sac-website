import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks/useEvents";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

interface EventForm {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  tags: string;
  is_upcoming: boolean;
  is_active: boolean;
}

const emptyForm: EventForm = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  location: "",
  image_url: "",
  tags: "",
  is_upcoming: true,
  is_active: true,
};

const AdminEvents = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventData = {
      title: form.title,
      description: form.description,
      event_date: form.event_date,
      event_time: form.event_time || null,
      location: form.location || null,
      image_url: form.image_url || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      is_upcoming: form.is_upcoming,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await updateEvent.mutateAsync({ id: editingId, ...eventData });
        toast.success("Event updated");
      } else {
        await createEvent.mutateAsync(eventData);
        toast.success("Event created");
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save event");
    }
  };

  const handleEdit = (event: NonNullable<typeof events>[number]) => {
    setForm({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time || "",
      location: event.location || "",
      image_url: event.image_url || "",
      tags: event.tags?.join(", ") || "",
      is_upcoming: event.is_upcoming,
      is_active: event.is_active,
    });
    setEditingId(event.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent.mutateAsync(id);
        toast.success("Event deleted");
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  const openNewDialog = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Events Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Manage campus events and activities
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Event" : "Create Event"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={form.event_date}
                    onChange={(e) =>
                      setForm({ ...form, event_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_time">Time</Label>
                  <Input
                    id="event_time"
                    value={form.event_time}
                    onChange={(e) =>
                      setForm({ ...form, event_time: e.target.value })
                    }
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="e.g., Main Auditorium"
                />
              </div>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="events"
                label="Event Image"
              />
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Cultural, Flagship"
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_upcoming"
                    checked={form.is_upcoming}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, is_upcoming: checked })
                    }
                  />
                  <Label htmlFor="is_upcoming">Upcoming</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                {(createEvent.isPending || updateEvent.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingId ? "Update" : "Create"} Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : events && events.length > 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {format(new Date(event.event_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{event.location || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {event.is_upcoming && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          Upcoming
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          event.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {event.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No events yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first campus event
          </p>
          <Button variant="gold" onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEvents;
