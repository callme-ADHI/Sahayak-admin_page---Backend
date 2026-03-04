import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { useCategories, useUpdateCategory } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

// Django category — id is a number, no Supabase Json type needed
interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  base_rate: string | null;   // DRF returns DecimalField as string
  is_active: boolean;
  display_order: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

const WorkCategories = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useCategories();
  const updateCategory = useUpdateCategory();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /* Edit form state */
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBaseRate, setEditBaseRate] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIcon, setEditIcon] = useState('');

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setEditBaseRate(category.base_rate ?? '');
    setEditIsActive(category.is_active);
    setEditIcon(category.icon || '');
    setShowEditModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  /* Soft-delete via Django PATCH is_deleted=true */
  const confirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await api.patch(`/marketplace/categories/${selectedCategory.id}/`, { is_deleted: true });
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowDeleteDialog(false);
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const saveEdit = async () => {
    if (!selectedCategory) return;
    try {
      await api.patch(`/marketplace/categories/${selectedCategory.id}/`, {
        name: editName,
        description: editDescription || null,
        base_rate: editBaseRate ? parseFloat(editBaseRate) : null,
        is_active: editIsActive,
        icon: editIcon || null,
      });
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowEditModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.name?.[0] || 'Failed to update category';
      toast.error(msg);
    }
  };

  const columns = [
    { key: 'name', header: 'Category Name', sortable: true },
    {
      key: 'description', header: 'Description',
      render: (cat: Category) => (
        <span className="text-muted-foreground line-clamp-1" title={cat.description || ''}>
          {cat.description || '-'}
        </span>
      ),
    },
    {
      key: 'base_rate', header: 'Base Rate', sortable: true,
      render: (cat: Category) => <span className="font-medium">₹{cat.base_rate || 0}</span>,
    },
    {
      key: 'is_active', header: 'Status',
      render: (cat: Category) => <StatusBadge status={cat.is_active ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions', header: 'Actions',
      render: (cat: Category) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleView(cat); }}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); handleDelete(cat); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Work Categories</h1>
          <p className="page-subtitle">Loading categories...</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Work Categories</h1>
          <p className="page-subtitle">Manage job types and category configurations</p>
        </div>
        <Button onClick={() => navigate('/works/create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          data={categories}
          columns={columns}
          searchPlaceholder="Search categories..."
          onRowClick={(cat) => handleView(cat as Category)}
        />
      </div>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory?.name}</DialogTitle>
            <DialogDescription>Category Details</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="font-medium">{selectedCategory.description || 'No description'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Base Rate</Label>
                <p className="font-medium text-lg">₹{selectedCategory.base_rate || 0}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <StatusBadge status={selectedCategory.is_active ? 'Active' : 'Inactive'} />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">{new Date(selectedCategory.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rate">Base Rate (₹)</Label>
              <Input id="edit-rate" type="number" value={editBaseRate} onChange={(e) => setEditBaseRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon URL / Name</Label>
              <Input id="edit-icon" value={editIcon} onChange={(e) => setEditIcon(e.target.value)} placeholder="e.g. briefcase" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={updateCategory.isPending}>
              {updateCategory.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkCategories;
