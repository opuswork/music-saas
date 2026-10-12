/**
 * Order indices already used by *other* blocks in the lesson (for duplicate checks).
 * In edit mode, the block being edited is excluded so its current index stays valid.
 */
export function takenOrderIndicesByOtherBlocks(
  blocks: { id: string; orderIndex: number }[],
  opts: { mode: "create" } | { mode: "edit"; editingBlockId: string },
): number[] {
  return blocks
    .filter((b) => opts.mode === "create" || b.id !== opts.editingBlockId)
    .map((b) => b.orderIndex);
}
