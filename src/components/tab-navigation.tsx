"use client";

import { X, XCircle, GripVertical } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTabs } from "@/contexts/tab-context";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTabProps {
  tab: {
    path: string;
    name: string;
  };
  isActive: boolean;
  onSwitch: (path: string) => void;
  onClose: (path: string, e: React.MouseEvent) => void;
  showClose: boolean;
}

function SortableTab({
  tab,
  isActive,
  onSwitch,
  onClose,
  showClose,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.path });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const combinedStyle = {
    ...style,
    marginBottom: isActive ? "-1px" : "0",
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      className={`
        group flex items-center gap-1 px-2 py-2
        border-r border-l border-t rounded-t-lg min-w-[120px] max-w-[200px]
        transition-colors relative
        ${
          isActive
            ? "bg-background border-border"
            : "bg-muted/50 border-transparent hover:bg-muted"
        }
      `}
    >
      <button
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      <span
        className="text-sm truncate flex-1 cursor-pointer"
        onClick={() => onSwitch(tab.path)}
      >
        {tab.name}
      </span>
      {showClose && (
        <button
          onClick={(e) => onClose(tab.path, e)}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent rounded p-1"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export function TabNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { tabs, removeTab, clearOtherTabs, reorderTabs } = useTabs();

  // Fixed Plan and Optimise tab
  const fixedTab = {
    path: "/dashboard/plan-optimise",
    name: "Plan and Optimise",
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const closeTab = (tabPath: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent closing the last tab
    if (tabs.length === 1) {
      return;
    }

    const tabIndex = tabs.findIndex((tab) => tab.path === tabPath);
    removeTab(tabPath);

    // If closing the active tab, navigate to an adjacent tab
    if (tabPath === pathname) {
      const remainingTabs = tabs.filter((tab) => tab.path !== tabPath);
      const nextTab = remainingTabs[tabIndex] || remainingTabs[tabIndex - 1];
      if (nextTab) {
        router.push(nextTab.path);
      }
    }
  };

  const handleCloseOtherTabs = () => {
    clearOtherTabs(pathname);
  };

  const switchTab = (path: string) => {
    router.push(path);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.path === active.id);
      const newIndex = tabs.findIndex((tab) => tab.path === over.id);
      reorderTabs(oldIndex, newIndex);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto flex-1">
        {/* Fixed Plan and Optimise Tab */}
        <div
          className={`
            flex items-center gap-1 px-3 py-2
            border-r border-l border-t rounded-t-lg min-w-[160px]
            transition-colors relative cursor-pointer
            ${
              pathname === fixedTab.path
                ? "bg-background border-border"
                : "bg-muted/50 border-transparent hover:bg-muted"
            }
          `}
          style={{ marginBottom: pathname === fixedTab.path ? "-1px" : "0" }}
          onClick={() => switchTab(fixedTab.path)}
        >
          <span className="text-sm font-medium">{fixedTab.name}</span>
        </div>

        {/* Draggable Tabs */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabs.map((tab) => tab.path)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableTab
                key={tab.path}
                tab={tab}
                isActive={pathname === tab.path}
                onSwitch={switchTab}
                onClose={closeTab}
                showClose={tabs.length > 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {tabs.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCloseOtherTabs}
          title="Close other tabs"
          className="ml-2"
        >
          <XCircle className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}
