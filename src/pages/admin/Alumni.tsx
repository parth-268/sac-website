import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTeamMembers, useUpdateTeamMember } from "@/hooks/useTeamMembers";
import {
  useAlumni,
  useArchiveAsAlumni,
  useRestoreFromAlumni,
} from "@/hooks/useAlumni";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Undo2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type TeamMember = Tables<"team_members">;

const AdminAlumni = () => {
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();
  const { data: alumni, isLoading: alumniLoading } = useAlumni();
  const archiveAsAlumni = useArchiveAsAlumni();
  const restoreFromAlumni = useRestoreFromAlumni();

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [batchYear, setBatchYear] = useState("");

  // Filter current (non-alumni) team members
  const currentMembers = teamMembers?.filter((m) => !m.is_alumni) || [];

  const openArchiveDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setBatchYear(new Date().getFullYear().toString());
    setArchiveDialogOpen(true);
  };

  const handleArchive = async () => {
    if (!selectedMember || !batchYear) return;

    try {
      await archiveAsAlumni.mutateAsync({
        id: selectedMember.id,
        batch_year: batchYear,
      });
      toast.success(`${selectedMember.name} moved to alumni`);
      setArchiveDialogOpen(false);
      setSelectedMember(null);
      setBatchYear("");
    } catch (err) {
      toast.error("Failed to archive member");
    }
  };

  const handleRestore = async (member: TeamMember) => {
    if (!confirm(`Restore ${member.name} to current team?`)) return;

    try {
      await restoreFromAlumni.mutateAsync(member.id);
      toast.success(`${member.name} restored to current team`);
    } catch (err) {
      toast.error("Failed to restore member");
    }
  };

  return (
    <AdminLayout title="Alumni Management">
      <Tabs defaultValue="archive" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="archive">Archive to Alumni</TabsTrigger>
          <TabsTrigger value="alumni">Alumni Directory</TabsTrigger>
        </TabsList>

        {/* Archive Tab */}
        <TabsContent value="archive">
          <Card>
            <CardHeader>
              <CardTitle>Current Team Members</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select team members to archive as alumni when they graduate
              </p>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : currentMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={member.image_url || undefined}
                              />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.designation}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openArchiveDialog(member)}
                            className="gap-2"
                          >
                            <GraduationCap className="h-4 w-4" />
                            Move to Alumni
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No current team members to archive
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alumni Tab */}
        <TabsContent value="alumni">
          <Card>
            <CardHeader>
              <CardTitle>Alumni Directory</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage past SAC members
              </p>
            </CardHeader>
            <CardContent>
              {alumniLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : alumni && alumni.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alumni.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={member.image_url || undefined}
                              />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium block">
                                {member.name}
                              </span>
                              {member.linkedin_url && (
                                <a
                                  href={member.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-accent hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.designation}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {member.batch_year || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(member)}
                            className="gap-2"
                          >
                            <Undo2 className="h-4 w-4" />
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No alumni in the directory yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Archive Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive to Alumni</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Moving{" "}
              <span className="font-medium text-foreground">
                {selectedMember?.name}
              </span>{" "}
              to alumni directory.
            </p>
            <div className="space-y-2">
              <Label>Graduation Batch Year *</Label>
              <Input
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                placeholder="e.g., 2024"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setArchiveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleArchive}
                disabled={archiveAsAlumni.isPending}
              >
                {archiveAsAlumni.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Archive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAlumni;
