"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUser } from "@/app/actions/users";
import { EditUserDialog } from "@/components/edit-user-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserWithRole } from "@/db/schema";
import { Can } from "@/lib/casl/context";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface UsersTableProps {
  users: UserWithRole[];
  dict?: Dictionary;
}

export function UsersTable({ users, dict }: UsersTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleDelete = async () => {
    if (!selectedUserId) return;

    setIsDeleting(true);
    const result = await deleteUser(selectedUserId);

    if (result.success) {
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
      router.refresh();
    } else {
      alert(result.error || "Failed to delete user");
    }
    setIsDeleting(false);
  };

  const openDeleteDialog = (userId: number) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (userId: number) => {
    setSelectedUserId(userId);
    setEditDialogOpen(true);
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No users found. Invite your first team member to get started.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict?.users.table.name || "Name"}</TableHead>
              <TableHead>{dict?.users.table.email || "Email"}</TableHead>
              <TableHead>{dict?.users.table.role || "Role"}</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name || "—"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role?.name || "—"}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Can I="update" a="User">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(user.id)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </Can>
                      <Can I="delete" a="User">
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(user.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </Can>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
