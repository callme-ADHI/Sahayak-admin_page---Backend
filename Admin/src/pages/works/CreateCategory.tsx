import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateCategory } from '@/hooks/useCategories';
import { toast } from 'sonner';

interface CustomField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

const CreateCategory = () => {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [requirePayment, setRequirePayment] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const prebuiltQuestions = [
    { id: 'problem_desc', label: 'Describe the problem', type: 'textarea' },
    { id: 'urgency', label: 'How urgent is this?', type: 'radio', options: ['Emergency', 'Within 24 hours', 'Within a week', 'Flexible'] },
    { id: 'property_type', label: 'Property Type', type: 'radio', options: ['Residential', 'Commercial', 'Industrial'] },
    { id: 'photos', label: 'Upload photos of the issue', type: 'file' },
    { id: 'preferred_time', label: 'Preferred time slot', type: 'radio', options: ['Morning', 'Afternoon', 'Evening'] },
  ];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { id: `field_${Date.now()}`, label: '', type: 'text', required: false, options: [] },
    ]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(fields =>
      fields.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const addOption = (fieldId: string) => {
    setCustomFields(fields =>
      fields.map(f => {
        if (f.id === fieldId) {
          return { ...f, options: [...(f.options || []), ''] };
        }
        return f;
      })
    );
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setCustomFields(fields =>
      fields.map(f => {
        if (f.id === fieldId && f.options) {
          const newOptions = [...f.options];
          newOptions[optionIndex] = value;
          return { ...f, options: newOptions };
        }
        return f;
      })
    );
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setCustomFields(fields =>
      fields.map(f => {
        if (f.id === fieldId && f.options) {
          return { ...f, options: f.options.filter((_, i) => i !== optionIndex) };
        }
        return f;
      })
    );
  };

  const removeField = (id: string) => {
    setCustomFields(fields => fields.filter(f => f.id !== id));
  };

  const togglePrebuiltQuestion = (question: typeof prebuiltQuestions[0]) => {
    const exists = customFields.find(f => f.id === question.id);
    if (exists) {
      removeField(question.id);
    } else {
      setCustomFields([
        ...customFields,
        { ...question, required: true },
      ]);
    }
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      await createCategory.mutateAsync({
        name: categoryName,
        description: description || undefined,
        base_rate: baseRate ? parseFloat(baseRate) : undefined,
      });
      toast.success('Category created successfully');
      navigate('/works/categories');
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const needsOptions = (type: string) => ['radio', 'checkbox', 'select'].includes(type);

  const renderPreviewField = (field: CustomField) => {
    switch (field.type) {
      case 'textarea':
        return <Textarea placeholder={`Enter ${field.label.toLowerCase()}...`} disabled className="bg-muted" />;
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name={field.id} disabled className="w-4 h-4" />
                <span className="text-sm">{opt}</span>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" disabled className="w-4 h-4" />
                <span className="text-sm">{opt}</span>
              </div>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
            Click to upload or drag and drop
          </div>
        );
      case 'date':
        return <Input type="date" disabled className="bg-muted" />;
      case 'number':
        return <Input type="number" placeholder="0" disabled className="bg-muted" />;
      default:
        return <Input placeholder={`Enter ${field.label.toLowerCase()}...`} disabled className="bg-muted" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="page-title">Create Work Category</h1>
          <p className="page-subtitle">Define a new job type with custom fields and questions</p>
        </div>
      </div>

      {/* Basic Details */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Plumbing, Electrical, Cleaning"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Tags help users find this category when searching</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this service category"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseRate">Base Rate (₹)</Label>
            <Input
              id="baseRate"
              type="number"
              placeholder="500"
              value={baseRate}
              onChange={e => setBaseRate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pre-built Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-built Questions</CardTitle>
          <p className="text-sm text-muted-foreground">Select common questions to include</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prebuiltQuestions.map(question => (
              <div key={question.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={question.id}
                  checked={customFields.some(f => f.id === question.id)}
                  onCheckedChange={() => togglePrebuiltQuestion(question)}
                />
                <label htmlFor={question.id} className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium">{question.label}</p>
                  <p className="text-xs text-muted-foreground">Type: {question.type}</p>
                  {question.options && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {question.options.map((opt, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{opt}</Badge>
                      ))}
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields Builder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Custom Fields</CardTitle>
            <p className="text-sm text-muted-foreground">Add additional questions for this category</p>
          </div>
          <Button onClick={addCustomField}>
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {customFields.filter(f => !prebuiltQuestions.some(p => p.id === f.id)).map((field) => (
            <div key={field.id} className="p-4 border border-border rounded-lg bg-muted/30 space-y-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-move" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Field Label</Label>
                    <Input
                      placeholder="Question text"
                      value={field.label}
                      onChange={e => updateField(field.id, { label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={value => updateField(field.id, { type: value, options: needsOptions(value) ? [] : undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Multiline Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="radio">Radio (Single Select)</SelectItem>
                        <SelectItem value="checkbox">Checkbox (Multi Select)</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={checked => updateField(field.id, { required: checked })}
                      />
                      <Label className="text-sm">Required</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Options for radio/checkbox/select */}
              {needsOptions(field.type) && (
                <div className="ml-8 space-y-2">
                  <Label className="text-sm">Options</Label>
                  {field.options?.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={e => updateOption(field.id, i, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeOption(field.id, i)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(field.id)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>
              )}
            </div>
          ))}
          {customFields.filter(f => !prebuiltQuestions.some(p => p.id === f.id)).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No custom fields added yet. Click "Add Field" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Pre-payment</p>
              <p className="text-sm text-muted-foreground">Users must pay before work is assigned</p>
            </div>
            <Switch checked={requirePayment} onCheckedChange={setRequirePayment} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button onClick={handleSave} disabled={createCategory.isPending}>
          {createCategory.isPending ? 'Saving...' : 'Save Category'}
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Application Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold">{categoryName || 'Category Name'}</h2>
              {description && <p className="text-muted-foreground mt-1">{description}</p>}
              {tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
              {baseRate && (
                <p className="text-lg font-semibold text-primary mt-2">Starting at ₹{baseRate}</p>
              )}
            </div>

            <div className="space-y-6">
              {customFields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label className="flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {renderPreviewField(field)}
                </div>
              ))}
            </div>

            {customFields.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No questions added yet. Add pre-built or custom questions to see them here.
              </p>
            )}

            <div className="border-t pt-4">
              <Button className="w-full" disabled>
                Submit Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCategory;
