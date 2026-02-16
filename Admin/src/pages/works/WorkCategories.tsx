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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Json } from '@/integrations/supabase/types';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  base_rate: number | null;
  is_active: boolean | null;
  display_order: number | null;
  metadata: Json | null;
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
  const [editTags, setEditTags] = useState('');

  const getTags = (category: Category): string[] => {
    if (category.metadata && typeof category.metadata === 'object' && 'tags' in category.metadata) {
      return (category.metadata as { tags: string[] }).tags || [];
    }
    return [];
  };

  const categoriesWithTags = categories.map(cat => ({
    ...cat,
    tagsString: getTags(cat).join(', ')
  }));

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setEditBaseRate(category.base_rate?.toString() || '');
    setEditIsActive(category.is_active ?? true);
    setEditIcon(category.icon || '');
    setEditTags(getTags(category).join(', '));
    setShowEditModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id);

      if (error) throw error;

      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const saveEdit = async () => {
    if (!selectedCategory) return;

    try {
      const tagsArray = editTags.split(',').map(t => t.trim()).filter(t => t);

      const { error } = await supabase
        .from('categories')
        .update({
          name: editName,
          description: editDescription || null,
          base_rate: editBaseRate ? parseFloat(editBaseRate) : null,
          is_active: editIsActive,
          icon: editIcon || null,
          metadata: { tags: tagsArray }
        })
        .eq('id', selectedCategory.id);

      if (error) {
        if (error.code === '23505' || error.message.includes('409')) {
          toast.error('Category name already exists');
          return;
        }
        throw error;
      }

      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowEditModal(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update category');
    }
  };

  const columns = [
    { key: 'name', header: 'Category Name', sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (cat: Category) => (
        <span className="text-muted-foreground line-clamp-1" title={cat.description || ''}>
          {cat.description || '-'}
        </span>
      )
    },
    {
      key: 'base_rate',
      header: 'Base Rate',
      sortable: true,
      render: (cat: Category) => (
        <span className="font-medium">₹{cat.base_rate || 0}</span>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (cat: Category) => <StatusBadge status={cat.is_active ? 'Active' : 'Inactive'} />
    },
    {
      key: 'tagsString', // Use the flat string for searching
      header: 'Tags',
      render: (cat: Category) => {
        const tags = getTags(cat);
        return tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
            {tags.length > 2 && <span className="text-xs text-muted-foreground self-center">+{tags.length - 2}</span>}
          </div>
        ) : '-';
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (cat: Category) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleView(cat);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(cat);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(cat);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
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
          data={categoriesWithTags}
          columns={columns}
          searchPlaceholder="Search categories..."
          onRowClick={handleView}
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
                <Label className="text-muted-foreground">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {getTags(selectedCategory).map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                  {getTags(selectedCategory).length === 0 && <p className="text-sm">No tags</p>}
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
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rate">Base Rate (₹)</Label>
              <Input
                id="edit-rate"
                type="number"
                value={editBaseRate}
                onChange={(e) => setEditBaseRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon URL / Name</Label>
              <Input
                id="edit-icon"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                placeholder="e.g. briefcase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Comma separated tags (e.g. urgent, premium)"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
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
