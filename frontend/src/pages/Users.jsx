import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, KeyRound, CheckCircle2, XCircle, UserCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PageLoader from "@/components/shared/PageLoader";
import API from "@/services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", role: "CASHIER", password: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load cashiers and users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openForm = (user = null) => {
    setEditUser(user);
    setForm(
      user
        ? { name: user.name, email: user.email, role: user.role.toUpperCase(), password: "", isActive: user.isActive !== false }
        : { name: "", email: "", role: "CASHIER", password: "", isActive: true }
    );
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await API.put(`/users/${editUser._id}`, payload);
        toast.success("Cashier/User updated successfully");
      } else {
        await API.post("/users", form);
        toast.success("Cashier account created successfully");
      }
      fetchUsers();
      setFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const newStatus = !user.isActive;
      await API.put(`/users/${user._id}`, { isActive: newStatus });
      toast.success(`Account for ${user.name} is now ${newStatus ? "Active" : "Deactivated"}`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setResetting(true);
    try {
      await API.put(`/users/${resetModalUser._id}`, { password: newPassword });
      toast.success(`Password for ${resetModalUser.name} has been reset`);
      setResetModalUser(null);
      setNewPassword("");
    } catch (err) {
      toast.error("Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/users/${deleteTarget._id}`);
      toast.success("Account deleted successfully");
      fetchUsers();
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cashier & Staff Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage, and audit Cashier and Administrator accounts
          </p>
        </div>
        <Button onClick={() => openForm()} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Cashier / Staff
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted/50 border-b text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">User Details</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              const isAdmin = u.role?.toUpperCase() === "ADMIN";
              const isActive = u.isActive !== false;

              return (
                <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isAdmin ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {isAdmin ? <ShieldAlert className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                      }`}
                      title="Click to toggle status"
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-red-600" /> Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Reset Password"
                      onClick={() => {
                        setResetModalUser(u);
                        setNewPassword("");
                      }}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit Account" onClick={() => openForm(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      title="Delete Account"
                      onClick={() => setDeleteTarget(u)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit Account" : "Create Cashier Account"}</DialogTitle>
            <DialogDescription>
              {editUser
                ? "Update user profile details and access rights."
                : "Create new credentials for a cashier or staff member."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email Address</Label>
              <Input
                id="user-email"
                type="email"
                required
                placeholder="cashier@pos.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-role">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-status">Account Status</Label>
              <Select
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(v) => setForm({ ...form, isActive: v === "active" })}
              >
                <SelectTrigger id="user-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-password">
                {editUser ? "New Password (Leave blank to keep unchanged)" : "Temporary Password"}
              </Label>
              <Input
                id="user-password"
                type="password"
                placeholder={editUser ? "••••••••" : "Create password"}
                required={!editUser}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editUser ? "Update Account" : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={!!resetModalUser} onOpenChange={(open) => !open && setResetModalUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for account: <strong>{resetModalUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-pass">New Password</Label>
              <Input
                id="reset-pass"
                type="password"
                placeholder="Enter new password (min 6 chars)"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetModalUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetting}>
                {resetting ? "Resetting..." : "Confirm Reset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Account"
        description={`Are you sure you want to permanently delete the account for ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
};

export default Users;
