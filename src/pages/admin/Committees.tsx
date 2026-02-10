import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useCommittees,
  useCreateCommittee,
  useUpdateCommittee,
} from "@/hooks/useCommittees";
import {
  useCommitteeMembers,
  useBulkInsertCommitteeMembers,
  useDeleteCommitteeMember,
  useUpdateCommitteeMemberOrder,
} from "@/hooks/useCommitteeMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function AdminCommittees() {
  const { data: committees } = useCommittees();
  const createCommittee = useCreateCommittee();
  const updateCommittee = useUpdateCommittee();

  const [open, setOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [email, setEmail] = useState("");
  const [icon, setIcon] = useState("Users");

  return (
    <AdminLayout title="Committees">
      <div className="flex justify-between mb-6">
        <p className="text-muted-foreground">Manage committees and members</p>
        <Button
          variant="gold"
          onClick={() => {
            setEditingCommittee(null);
            setName("");
            setDescription("");
            setIsActive(true);
            setEmail("");
            setIcon("Users");
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Committee
        </Button>
      </div>

      {/* Committees Table */}
      {!committees ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : committees.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
          No committees found. Click <strong>Add Committee</strong> to get
          started.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[45%]">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {committees.map((committee: any) => (
                <TableRow key={committee.id}>
                  <TableCell className="font-medium max-w-[220px] truncate">
                    {committee.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[500px]">
                    <div className="line-clamp-3 whitespace-normal break-words">
                      {committee.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {committee.is_active ? (
                      <span className="text-xs font-semibold text-green-600">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-600">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCommittee(committee);
                        setName(committee.name);
                        setDescription(committee.description);
                        setIsActive(committee.is_active);
                        setEmail(committee.email || "");
                        setIcon(committee.icon || "Users");
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            setEditingCommittee(null);
            setName("");
            setDescription("");
            setIsActive(true);
            setEmail("");
            setIcon("Users");
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingCommittee ? "Edit Committee" : "Add Committee"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 space-y-6">
            {/* Committee Info */}
            <div className="space-y-4">
              <Input
                placeholder="Committee Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                placeholder="Committee Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <Input
                placeholder="Committee Email (public contact)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="Users">Users</option>
                <option value="GraduationCap">GraduationCap</option>
                <option value="Calendar">Calendar</option>
                <option value="Briefcase">Briefcase</option>
                <option value="Shield">Shield</option>
              </select>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-muted-foreground">
                  Committee is active (visible publicly)
                </span>
              </div>
            </div>

            {editingCommittee?.id && (
              <MembersSection committeeId={editingCommittee.id} />
            )}
          </div>

          <div className="pt-4 border-t">
            <Button
              className="w-full"
              onClick={async () => {
                try {
                  if (editingCommittee) {
                    await updateCommittee.mutateAsync({
                      id: editingCommittee.id,
                      name,
                      description,
                      email,
                      icon,
                      is_active: isActive,
                    });
                  } else {
                    await createCommittee.mutateAsync({
                      name,
                      description,
                      email,
                      icon,
                      is_active: isActive,
                    });
                  }
                  toast.success("Committee saved");
                  setOpen(false);
                } catch {
                  toast.error("Failed to save committee");
                }
              }}
            >
              Save Committee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function MembersSection({ committeeId }: { committeeId: string }) {
  const { data: members } = useCommitteeMembers(committeeId);
  const bulkInsert = useBulkInsertCommitteeMembers();
  const deleteMember = useDeleteCommitteeMember();
  const updateOrder = useUpdateCommitteeMemberOrder();

  const [localMembers, setLocalMembers] = useState<any[]>([]);

  useEffect(() => {
    if (members) setLocalMembers(members);
  }, [members]);

  const [member, setMember] = useState({
    name: "",
    designation: "",
    phone: "",
  });

  const uploadExcel = useCallback(
    async (file: File) => {
      if (!committeeId) {
        toast.error("Save the committee before uploading members.");
        return;
      }

      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]);

      const valid: any[] = [];
      const errors: string[] = [];

      rows.forEach((r, i) => {
        if (!r.name || !r.designation) {
          errors.push(`Row ${i + 2}: name and designation are required`);
          return;
        }

        valid.push({
          committee_id: committeeId,
          name: r.name,
          designation: r.designation,
          phone: r.phone || null,
        });
      });

      if (errors.length) {
        toast.error(
          <div className="max-h-40 overflow-auto">
            <strong>{errors.length} Excel error(s):</strong>
            <ul className="list-disc ml-4 mt-2">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>,
        );
      }

      if (valid.length) {
        await bulkInsert.mutateAsync(valid);
        toast.success(`${valid.length} members imported`);
      }
    },
    [bulkInsert, committeeId],
  );

  const downloadTemplate = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet([
      { name: "John Doe", designation: "Secretary", phone: "9876543210" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "committee_members_template.xlsx");
  }, []);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold">Committee Members</h3>

      {/* Manual Add */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input
          placeholder="Name"
          value={member.name}
          onChange={(e) => setMember({ ...member, name: e.target.value })}
        />
        <Input
          placeholder="Designation"
          value={member.designation}
          onChange={(e) =>
            setMember({ ...member, designation: e.target.value })
          }
        />
        <Input
          placeholder="Phone"
          value={member.phone}
          onChange={(e) => setMember({ ...member, phone: e.target.value })}
        />
      </div>
      <Button
        size="sm"
        disabled={!member.name || !member.designation}
        onClick={async () => {
          if (!committeeId) {
            toast.error("Save the committee before adding members.");
            return;
          }

          await bulkInsert.mutateAsync([
            {
              committee_id: committeeId,
              name: member.name,
              designation: member.designation,
              phone: member.phone || null,
            },
          ]);
          setMember({ name: "", designation: "", phone: "" });
          toast.success("Member added");
        }}
      >
        Add Member
      </Button>

      {/* Excel Upload & Template Download */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-accent">
          <Upload className="h-4 w-4" />
          Upload Excel
          <input
            type="file"
            hidden
            accept=".xlsx,.csv"
            onChange={(e) => e.target.files && uploadExcel(e.target.files[0])}
          />
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={downloadTemplate}
          className="text-xs"
        >
          Download Excel Template
        </Button>
      </div>

      {/* Members List */}
      <div className="border rounded-md divide-y text-sm">
        {localMembers
          ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((m, index) => (
            <div
              key={m.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("id", m.id)}
              onDrop={(e) => {
                const draggedId = e.dataTransfer.getData("id");
                if (!draggedId || draggedId === m.id) return;

                // Optimistic reorder
                const reordered = [...localMembers];
                const draggedIndex = reordered.findIndex(
                  (x) => x.id === draggedId,
                );
                if (draggedIndex === -1) return;

                const [moved] = reordered.splice(draggedIndex, 1);
                reordered.splice(index, 0, moved);

                // Apply immediately
                setLocalMembers(reordered);

                updateOrder.mutate({
                  draggedId,
                  targetIndex: index,
                  members: reordered,
                });
              }}
              onDragOver={(e) => e.preventDefault()}
              className="flex justify-between p-3 text-sm cursor-move transition-transform duration-200 ease-out active:scale-[0.98]"
            >
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-muted-foreground">{m.designation}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  deleteMember.mutate(m.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
