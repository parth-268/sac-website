import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAlumniMembers, useTeamMutations } from "@/hooks/useTeamData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Undo2, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminAlumni() {
  const { data: alumni, isLoading } = useAlumniMembers();
  const { restoreToTeam, deleteMember } = useTeamMutations();
  const [searchTerm, setSearchTerm] = useState("");

  const handleRestore = async (id: string, name: string) => {
    if (confirm(`Restore ${name} to current team?`)) {
      try {
        await restoreToTeam.mutateAsync(id);
        toast.success("Restored to active team");
      } catch (e) {
        toast.error("Failed to restore");
      }
    }
  };

  const filteredAlumni = alumni?.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.batch_year?.includes(searchTerm),
  );

  if (isLoading)
    return (
      <AdminLayout title="Alumni">
        <Loader2 className="animate-spin mx-auto mt-10" />
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="Alumni Directory"
      description="History of past council members."
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Alumni Records</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or batch..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlumni && filteredAlumni.length > 0 ? (
                filteredAlumni.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.image_url || ""} />
                          <AvatarFallback>
                            {member.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {member.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.designation}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-600 font-mono"
                      >
                        {member.batch_year || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(member.id, member.name)}
                          title="Restore to Team"
                        >
                          <Undo2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete permanently?"))
                              deleteMember.mutate(member.id);
                          }}
                          title="Delete Permanently"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No alumni found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
