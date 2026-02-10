import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  useClubMembers,
  useCreateClubMember,
  useDeleteClubMember,
  useBulkInsertClubMembers,
  useUpdateClubMemberOrder,
} from "@/hooks/useClubMembers";

type Props = {
  clubId: string | null;
  open: boolean;
  onClose: () => void;
};

type ClubMember = {
  id: string;
  club_id: string;
  name: string;
  designation: string;
  phone: string | null;
  email: string | null;
  role: "senior" | "junior";
  display_order: number;
};

const SortableItem = ({ member }: { member: ClubMember }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: member.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between rounded-md border p-3 bg-background"
    >
      <div className="flex items-center gap-3">
        <span className="cursor-grab text-muted-foreground">⋮⋮</span>
        <div>
          <p className="font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.designation}</p>
        </div>
      </div>
    </div>
  );
};

export const ClubMembersDrawer = ({ clubId, open, onClose }: Props) => {
  const [role, setRole] = useState<"senior" | "junior">("senior");
  const { data: members, isLoading } = useClubMembers(clubId!, role);
  const createMember = useCreateClubMember();
  const deleteMember = useDeleteClubMember();
  const bulkInsert = useBulkInsertClubMembers();
  const updateOrder = useUpdateClubMemberOrder();

  const isMutating =
    deleteMember.isPending || bulkInsert.isPending || updateOrder.isPending;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [recentlyDeleted, setRecentlyDeleted] = useState<ClubMember[]>([]);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => setSelected(new Set()), [role, clubId]);

  useEffect(() => {
    if (recentlyDeleted.length === 0) return;

    const t = setTimeout(() => setRecentlyDeleted([]), 6000);
    return () => clearTimeout(t);
  }, [recentlyDeleted]);

  const handleExcelUpload = async (file: File) => {
    setExcelErrors([]);
    setIsParsingExcel(true);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      const existingNames = new Set(
        (members ?? []).map((m) => m.name.toLowerCase()),
      );

      const valid = rows
        .filter(
          (r) =>
            r.name &&
            r.designation &&
            !existingNames.has(String(r.name).toLowerCase()),
        )
        .map((r, i) => ({
          club_id: clubId!,
          name: String(r.name),
          designation: String(r.designation),
          phone: r.phone ? String(r.phone) : null,
          email: r.email ? String(r.email) : null,
          role,
          display_order: i,
        }));

      if (valid.length === 0) {
        setExcelErrors(["No valid rows found"]);
        return;
      }

      await bulkInsert.mutateAsync({
        club_id: clubId!,
        members: valid,
      });

      toast.success(`${valid.length} members imported`);
    } catch {
      setExcelErrors(["Failed to parse Excel file"]);
    } finally {
      setIsParsingExcel(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Club Members</DialogTitle>
        </DialogHeader>

        <Tabs value={role} onValueChange={(v) => setRole(v as any)}>
          <TabsList>
            <TabsTrigger value="senior">Senior</TabsTrigger>
            <TabsTrigger value="junior">Junior</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 flex items-center gap-4">
          <label
            htmlFor="excel-upload"
            className="cursor-pointer rounded-md border border-input px-3 py-1 text-sm hover:bg-muted/50"
          >
            {isParsingExcel ? "Importing..." : "Import Excel"}
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const ws = XLSX.utils.json_to_sheet([
                { name: "", designation: "", phone: "", email: "" },
              ]);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Members");
              XLSX.writeFile(wb, "club_members_template.xlsx");
            }}
          >
            Download Template
          </Button>
          <input
            id="excel-upload"
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleExcelUpload(e.target.files[0]);
              }
              e.target.value = "";
            }}
            disabled={isParsingExcel}
          />
          {excelErrors.length > 0 && (
            <div className="text-sm text-destructive">
              {excelErrors.join(", ")}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !members || members.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-10">
            No members added yet.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={async (event) => {
              if (isMutating || isParsingExcel) return;

              const { active, over } = event;
              if (!over || active.id === over.id || !members) return;

              const oldIndex = members.findIndex((m) => m.id === active.id);
              const newIndex = members.findIndex((m) => m.id === over.id);

              const reordered = [...members];
              const [moved] = reordered.splice(oldIndex, 1);
              reordered.splice(newIndex, 0, moved);

              await updateOrder.mutateAsync(
                reordered.map((m, i) => ({
                  id: m.id,
                  display_order: i,
                })),
              );
            }}
          >
            <SortableContext
              items={members.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 mt-4">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <SortableItem member={m} />
                    <Button
                      aria-label={`Delete ${m.name}`}
                      size="icon"
                      variant="ghost"
                      disabled={isMutating}
                      onClick={async () => {
                        setRecentlyDeleted([m]);
                        await deleteMember.mutateAsync({
                          id: m.id,
                          club_id: m.club_id,
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {recentlyDeleted.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border bg-background px-4 py-2 shadow flex items-center gap-4">
            <span className="text-sm">
              {recentlyDeleted.length} member deleted
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await bulkInsert.mutateAsync({
                  club_id: clubId!,
                  members: recentlyDeleted.map((m, i) => ({
                    ...m,
                    display_order: i,
                  })),
                });
                setRecentlyDeleted([]);
              }}
            >
              Undo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
