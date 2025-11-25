// utils/network.utils.ts
import { axiosClient } from "@/config/axios.config";

export interface NetworkOptimizationConfig {
  enableCompression: boolean;
  enableCaching: boolean;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
}

export const defaultNetworkConfig: NetworkOptimizationConfig = {
  enableCompression: true,
  enableCaching: true,
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  batchSize: 1000
};

/**
 * Creates optimized request configuration for large data sets
 */
export function createOptimizedRequestConfig(
  endpoint: string,
  config: Partial<NetworkOptimizationConfig> = {}
): RequestInit {
  const finalConfig = { ...defaultNetworkConfig, ...config };
  
  return {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': finalConfig.enableCompression ? 'gzip, deflate, br' : 'identity',
      'Cache-Control': finalConfig.enableCaching ? 'max-age=300' : 'no-cache',
      'Connection': 'keep-alive',
    },
    signal: AbortSignal.timeout(finalConfig.timeout),
  };
}

/**
 * Batches large requests into smaller chunks to prevent memory issues
 */
export async function batchRequest<T>(
  requestFn: (params: any) => Promise<T[]>,
  params: any,
  batchSize: number = 1000
): Promise<T[]> {
  const results: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const batchParams = {
        ...params,
        limit: batchSize,
        offset: offset
      };

      const batch = await requestFn(batchParams);
      results.push(...batch);

      if (batch.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }

      // Add small delay between batches to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching batch at offset ${offset}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Implements exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Creates a memory-efficient data stream for very large datasets
 */
export async function* streamData<T>(
  requestFn: (params: any) => Promise<T[]>,
  params: any,
  batchSize: number = 1000
): AsyncGenerator<T[], void, unknown> {
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const batchParams = {
        ...params,
        limit: batchSize,
        offset: offset
      };

      const batch = await retryWithBackoff(() => requestFn(batchParams));
      
      if (batch.length === 0) {
        hasMore = false;
      } else {
        yield batch;
        offset += batchSize;
      }

      // Small delay to prevent server overload
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error streaming batch at offset ${offset}:`, error);
      throw error;
    }
  }
}

/**
 * Monitors network performance and provides metrics
 */
export class NetworkPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  startRequest(url: string): void {
    this.startTimes.set(url, performance.now());
  }

  endRequest(url: string): void {
    const startTime = this.startTimes.get(url);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (!this.metrics.has(url)) {
        this.metrics.set(url, []);
      }
      this.metrics.get(url)!.push(duration);
      this.startTimes.delete(url);
    }
  }

  getAverageResponseTime(url: string): number {
    const times = this.metrics.get(url) || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, { average: number; count: number; min: number; max: number }> = {};
    
    this.metrics.forEach((times, url) => {
      if (times.length > 0) {
        const average = times.reduce((a, b) => a + b, 0) / times.length;
        result[url] = {
          average: Math.round(average),
          count: times.length,
          min: Math.round(Math.min(...times)),
          max: Math.round(Math.max(...times))
        };
      }
    });

    return result;
  }

  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Global network monitor instance
export const networkMonitor = new NetworkPerformanceMonitor();