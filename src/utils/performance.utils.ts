/**
 * Performance utilities for optimizing data processing
 */

/**
 * Debounce function to limit frequency of expensive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Batch process large arrays to prevent blocking the main thread
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize: number = 100,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = batch.map(processor)
    results.push(...batchResults)
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length)
    }
    
    // Yield to event loop to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  
  return results
}

/**
 * Create a memoized selector for expensive calculations
 */
export function createMemoizedSelector<T, R>(
  selector: (state: T) => R,
  equals: (a: R, b: R) => boolean = Object.is
): (state: T) => R {
  let lastState: T | undefined
  let lastResult: R | undefined
  
  return (state: T): R => {
    if (lastState !== undefined && equals(selector(lastState), selector(state))) {
      return lastResult!
    }
    
    lastState = state
    lastResult = selector(state)
    return lastResult
  }
}

/**
 * Optimize array operations using Maps for O(1) lookups
 */
export function createLookupMap<T, K>(
  items: T[],
  keySelector: (item: T) => K
): Map<K, T> {
  return new Map(items.map(item => [keySelector(item), item]))
}

/**
 * Efficiently group array items by key
 */
export function groupBy<T, K>(
  items: T[],
  keySelector: (item: T) => K
): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  
  for (const item of items) {
    const key = keySelector(item)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(item)
  }
  
  return groups
}

/**
 * Web Worker helper for CPU-intensive tasks
 */
export class WorkerPool {
  private workers: Worker[] = []
  private queue: Array<{ task: any; resolve: (value: any) => void; reject: (error: any) => void }> = []
  private activeJobs = new Map<Worker, boolean>()
  
  constructor(workerScript: string, poolSize: number = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript)
      this.workers.push(worker)
      this.activeJobs.set(worker, false)
      
      worker.onmessage = (event) => {
        this.activeJobs.set(worker, false)
        this.processQueue()
      }
      
      worker.onerror = (error) => {
        this.activeJobs.set(worker, false)
        console.error('Worker error:', error)
      }
    }
  }
  
  async execute<T>(task: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.processQueue()
    })
  }
  
  private processQueue() {
    if (this.queue.length === 0) return
    
    const availableWorker = Array.from(this.activeJobs.entries())
      .find(([worker, isBusy]) => !isBusy)?.[0]
    
    if (availableWorker) {
      const job = this.queue.shift()!
      this.activeJobs.set(availableWorker, true)
      availableWorker.postMessage(job.task)
    }
  }
  
  terminate() {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.queue = []
  }
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}