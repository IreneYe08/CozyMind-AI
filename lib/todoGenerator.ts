/**
 * TODO List Generator
 * Generates desk-specific cleaning tasks
 * Note: For full image analysis, integrate with a vision API service
 * Currently returns smart defaults based on common desk organization needs
 */

export interface TodoItem {
  task: string
  reason?: string
}

/**
 * Generate personalized TODO list based on before image
 * @param imageBuffer - The before image buffer (currently used for future image analysis)
 * @returns Array of desk-specific cleaning tasks
 */
export async function generateTodoList(imageBuffer: Buffer): Promise<TodoItem[]> {
  // TODO: Integrate with image analysis service (e.g., Replicate, Stability AI vision, etc.)
  // For now, return smart defaults that are always relevant for desk organization
  
  console.log('[todoGenerator] Generating desk-specific TODO list...')
  
  // Return default tasks that are always applicable to desk organization
  // These are safe, generic tasks that work for any desk
  return getDefaultTodoList()
}

/**
 * Default TODO list when AI analysis is not available
 * STRICT: Only desk-level tasks, no laundry, dishes, floor, bedroom, etc.
 */
function getDefaultTodoList(): TodoItem[] {
  return [
    {
      task: 'Throw away food packaging and snack wrappers on desk',
      reason: 'Remove visible trash from desk surface',
    },
    {
      task: 'Wipe the desk surface clean',
      reason: 'Remove dust and stains from desk',
    },
    {
      task: 'Organize cables into a tidy group with cable clips',
      reason: 'Keep cables neat and organized on desk',
    },
    {
      task: 'Stack notebooks and papers neatly',
      reason: 'Organize documents on desk',
    },
    {
      task: 'Move loose small items into a storage tray',
      reason: 'Group scattered desk items together',
    },
    {
      task: 'Group pens and stationery together in a holder',
      reason: 'Keep writing tools organized on desk',
    },
  ]
}

