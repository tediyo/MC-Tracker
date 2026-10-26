"use client";

import * as React from "react";
import {
  FolderPlus,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Tag,
  Layers,
  Activity,
  GraduationCap,
  Laptop,
  Compass,
  HeartHandshake,
  TrendingUp,
  Car,
  ChevronRight,
  Info,
} from "lucide-react";
import { useCategories } from "@/components/providers/category-provider";
import { INTEREST_PRESETS, type InterestPreset } from "@mc-tracker/shared-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PRESET_ICONS: Record<string, React.ElementType> = {
  Activity,
  GraduationCap,
  Laptop,
  Compass,
  HeartHandshake,
  TrendingUp,
  Car,
  Tag,
};

const COLOR_PALETTES = [
  { name: "Emerald", value: "#10b981", class: "bg-emerald-500" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Amber", value: "#f59e0b", class: "bg-amber-500" },
  { name: "Purple", value: "#8b5cf6", class: "bg-purple-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Rose", value: "#f43f5e", class: "bg-rose-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
];

export function DynamicCategoriesSettings() {
  const {
    customCategories,
    customSubcategories,
    categories,
    categoryLabels,
    categorySubcategoryMap,
    subcategoryLabels,
    activePresetIds,
    addCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    toggleInterestPreset,
    isLoading,
  } = useCategories();

  // Custom Category Dialog State
  const [isCatDialogOpen, setIsCatDialogOpen] = React.useState(false);
  const [newCatLabel, setNewCatLabel] = React.useState("");
  const [newCatColor, setNewCatColor] = React.useState(COLOR_PALETTES[0]?.value || "#10b981");
  const [isSavingCat, setIsSavingCat] = React.useState(false);
  const [catError, setCatError] = React.useState("");

  // Custom Subcategory Dialog State
  const [isSubDialogOpen, setIsSubDialogOpen] = React.useState(false);
  const [selectedParentCat, setSelectedParentCat] = React.useState(categories[0] || "basic");
  const [newSubLabel, setNewSubLabel] = React.useState("");
  const [isSavingSub, setIsSavingSub] = React.useState(false);
  const [subError, setSubError] = React.useState("");

  // Filter or selected category for the inspector view
  const [selectedViewCat, setSelectedViewCat] = React.useState<string>("all");

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");
    const trimmed = newCatLabel.trim();
    if (!trimmed) {
      setCatError("Please enter a category title");
      return;
    }

    setIsSavingCat(true);
    try {
      const generatedKey = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      await addCategory({
        key: generatedKey,
        label: trimmed,
        color: newCatColor,
        icon: "Tag",
      });
      setNewCatLabel("");
      setIsCatDialogOpen(false);
    } catch (err: any) {
      setCatError(err.message || "Failed to create category");
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError("");
    const trimmed = newSubLabel.trim();
    if (!trimmed) {
      setSubError("Please enter a subcategory name");
      return;
    }

    setIsSavingSub(true);
    try {
      const generatedKey = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      await addSubcategory({
        categoryKey: selectedParentCat,
        key: generatedKey,
        label: trimmed,
      });
      setNewSubLabel("");
      setIsSubDialogOpen(false);
    } catch (err: any) {
      setSubError(err.message || "Failed to create subcategory");
    } finally {
      setIsSavingSub(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner / Card */}
      <Card className="viz-root border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Dynamic Categories & Subcategories</CardTitle>
                <CardDescription className="text-xs">
                  Customize expense classifications to match your lifestyle and personal interests. All changes write directly to your database.
                </CardDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Add Custom Category Dialog */}
              <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs">
                    <Plus className="h-4 w-4" />
                    <span>New Category</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FolderPlus className="h-5 w-5 text-emerald-500" />
                      <span>Create Custom Category</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Add a new top-level classification (e.g. "Fitness", "Investment", "Freelance").
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateCategory} className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="cat-name">Category Title *</Label>
                      <Input
                        id="cat-name"
                        placeholder="e.g. Fitness & Health"
                        value={newCatLabel}
                        onChange={(e) => {
                          setNewCatLabel(e.target.value);
                          if (catError) setCatError("");
                        }}
                        autoFocus
                      />
                      {catError ? <p className="text-xs text-destructive">{catError}</p> : null}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Accent Color</Label>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {COLOR_PALETTES.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewCatColor(color.value)}
                            className={cn(
                              "h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center",
                              color.class,
                              newCatColor === color.value
                                ? "border-foreground scale-110 shadow-sm"
                                : "border-transparent opacity-80 hover:opacity-100"
                            )}
                            title={color.name}
                          >
                            {newCatColor === color.value && (
                              <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsCatDialogOpen(false)}
                        disabled={isSavingCat}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSavingCat || !newCatLabel.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {isSavingCat ? "Saving..." : "Save Category"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Custom Subcategory Dialog */}
              <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-xl font-medium text-xs">
                    <Plus className="h-4 w-4" />
                    <span>New Subcategory</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-500" />
                      <span>Add Subcategory</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Attach a new subcategory to any existing or custom category.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateSubcategory} className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="parent-cat">Parent Category</Label>
                      <Select
                        value={selectedParentCat}
                        onValueChange={(val) => setSelectedParentCat(val)}
                      >
                        <SelectTrigger id="parent-cat">
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {categoryLabels[c] || c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sub-name">Subcategory Name *</Label>
                      <Input
                        id="sub-name"
                        placeholder="e.g. Supplements, Electricity, Gym"
                        value={newSubLabel}
                        onChange={(e) => {
                          setNewSubLabel(e.target.value);
                          if (subError) setSubError("");
                        }}
                        autoFocus
                      />
                      {subError ? <p className="text-xs text-destructive">{subError}</p> : null}
                    </div>

                    <DialogFooter className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsSubDialogOpen(false)}
                        disabled={isSavingSub}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSavingSub || !newSubLabel.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {isSavingSub ? "Saving..." : "Save Subcategory"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Section 1: User Interest Starter Presets */}
        <CardContent className="border-t border-border/40 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">Interest Starter Packs</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              1-click activate curated categories & subcategories based on your interests
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {INTEREST_PRESETS.map((preset) => {
              const isActive = activePresetIds.includes(preset.id);
              const IconComponent = PRESET_ICONS[preset.icon] || Tag;

              return (
                <div
                  key={preset.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200",
                    isActive
                      ? "border-emerald-500/50 bg-emerald-500/5 shadow-sm"
                      : "border-border/60 bg-card hover:border-border hover:bg-accent/40"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${preset.color}20`,
                            color: preset.color,
                          }}
                        >
                          <IconComponent className="h-4 w-4" />
                        </span>
                        <h4 className="text-xs font-bold text-foreground leading-tight">
                          {preset.title}
                        </h4>
                      </div>
                      {isActive && (
                        <span className="flex h-5 items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                      {preset.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.subcategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub.key}
                          className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium"
                        >
                          {sub.label}
                        </span>
                      ))}
                      {preset.subcategories.length > 3 && (
                        <span className="rounded-md bg-muted/40 px-1 py-0.5 text-[10px] text-muted-foreground">
                          +{preset.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? "outline" : "default"}
                    onClick={() => toggleInterestPreset(preset.id)}
                    className={cn(
                      "w-full h-8 rounded-lg text-xs font-semibold",
                      isActive
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    )}
                  >
                    {isActive ? "Remove Pack" : "Add Interest Pack"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Active Categories & Subcategories Inspector */}
      <Card className="viz-root border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base">Active Categories & Subcategories</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Total Categories: <strong className="text-foreground">{categories.length}</strong> (
              {customCategories.length} custom)
            </span>
          </div>
          <CardDescription className="text-xs">
            Review all active categories available when logging expenses or filtering analytics. Custom additions can be deleted at any time.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((catKey) => {
              const isCustomCat = customCategories.some((c) => c.key === catKey);
              const customCatObj = customCategories.find((c) => c.key === catKey);
              const subs = categorySubcategoryMap[catKey] ?? [];

              return (
                <div
                  key={catKey}
                  className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-3.5 shadow-sm"
                >
                  {/* Category Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
                          style={{
                            backgroundColor: customCatObj?.color
                              ? `${customCatObj.color}20`
                              : "var(--muted)",
                            color: customCatObj?.color || "inherit",
                          }}
                        >
                          <Tag className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="text-xs font-bold text-foreground">
                          {categoryLabels[catKey] || catKey}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {isCustomCat ? (
                          <>
                            <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                              Custom
                            </Badge>
                            <button
                              onClick={() => deleteCategory(catKey)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Built-in
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Subcategories list */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-border/40">
                      {subs.map((subKey) => {
                        const isCustomSub = customSubcategories.some(
                          (s) => s.categoryKey === catKey && s.key === subKey
                        );

                        return (
                          <span
                            key={subKey}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border",
                              isCustomSub
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-muted/50 border-border/50 text-foreground/80"
                            )}
                          >
                            <span>{subcategoryLabels[subKey] || subKey}</span>
                            {isCustomSub && (
                              <button
                                onClick={() => deleteSubcategory(catKey, subKey)}
                                className="text-emerald-600/70 hover:text-destructive p-0.5 transition-colors"
                                title="Remove subcategory"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
