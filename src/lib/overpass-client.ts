// src/lib/overpass-client.ts
import { OverpassMonitoring } from "./overpass-monitoring";

export interface OverpassEndpoint {
  url: string;
  lastUsed: number;
  errorCount: number;
  isHealthy: boolean;
}

export class OverpassClient {
  private endpoints: OverpassEndpoint[] = [
    {
      url: "https://overpass-api.de/api/interpreter",
      lastUsed: 0,
      errorCount: 0,
      isHealthy: true,
    },
    {
      url: "https://overpass.kumi.systems/api/interpreter",
      lastUsed: 0,
      errorCount: 0,
      isHealthy: true,
    },
    {
      url: "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      lastUsed: 0,
      errorCount: 0,
      isHealthy: true,
    },
  ];

  private readonly MAX_ERRORS = 5;
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private rateLimiter = {
    requests: new Map<string, { count: number; resetTime: number }>(),
    maxRequests: 5,
    windowMs: 60 * 1000,
  };

  private monitoring: OverpassMonitoring;

  constructor() {
    this.monitoring = new OverpassMonitoring();
    this.startHealthChecks();
  }

  private startHealthChecks(): void {
    setInterval(() => this.checkEndpointsHealth(), this.HEALTH_CHECK_INTERVAL);
  }

  private async checkEndpointsHealth(): Promise<void> {
    for (const endpoint of this.endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: "HEAD",
          headers: { "User-Agent": "CourtFinder/1.0" },
          signal: AbortSignal.timeout(5000), // 5 second timeout for health check
        });
        endpoint.isHealthy = response.ok;
        if (response.ok) {
          endpoint.errorCount = 0;
        }
      } catch (error) {
        endpoint.isHealthy = false;
      }
    }
  }

  private handleOverpassError(error: any): Error {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return new Error("Network error: Unable to connect to Overpass API");
    }
    if (error.name === "AbortError") {
      return new Error(
        "Request timeout: Overpass API took too long to respond"
      );
    }
    if (error.message?.includes("timeout")) {
      return new Error("Overpass API request timed out");
    }
    if (error.message?.includes("rate limit")) {
      return new Error("Overpass API rate limit exceeded");
    }
    if (error.message?.includes("memory limit")) {
      return new Error("Overpass API memory limit exceeded");
    }
    return error;
  }

  public async executeQuery(query: string, retries = 3): Promise<any> {
    const startTime = Date.now();
    const endpoint = this.selectEndpoint();

    if (!endpoint.isHealthy) {
      throw new Error("No healthy Overpass API endpoints available");
    }

    try {
      await this.checkRateLimit(endpoint.url);
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT
      );

      const response = await fetch(endpoint.url, {
        method: "POST",
        body: query,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "CourtFinder/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw this.handleOverpassError(
          new Error(
            `Overpass API error: ${response.status} ${response.statusText} - ${errorText}`
          )
        );
      }

      const data = await response.json();
      endpoint.lastUsed = Date.now();
      this.monitoring.recordRequest(true, Date.now() - startTime);
      return data;
    } catch (error) {
      endpoint.errorCount++;
      if (endpoint.errorCount >= this.MAX_ERRORS) {
        endpoint.isHealthy = false;
      }
      this.monitoring.recordRequest(false, Date.now() - startTime);

      if (retries > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (3 - retries))
        );
        return this.executeQuery(query, retries - 1);
      }
      throw this.handleOverpassError(error);
    }
  }

  private selectEndpoint(): OverpassEndpoint {
    const healthyEndpoints = this.endpoints.filter((e) => e.isHealthy);
    if (healthyEndpoints.length === 0) {
      throw new Error("No healthy Overpass API endpoints available");
    }
    return healthyEndpoints.reduce((best, current) =>
      current.errorCount < best.errorCount ? current : best
    );
  }

  private async checkRateLimit(endpointUrl: string): Promise<void> {
    const now = Date.now();
    const key = endpointUrl;
    const limit = this.rateLimiter.requests.get(key);

    // Clean up expired rate limits
    for (const [k, v] of this.rateLimiter.requests.entries()) {
      if (now >= v.resetTime) {
        this.rateLimiter.requests.delete(k);
      }
    }

    if (
      limit &&
      now < limit.resetTime &&
      limit.count >= this.rateLimiter.maxRequests
    ) {
      const waitTime = limit.resetTime - now;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.rateLimiter.requests.set(key, {
      count: (limit?.count || 0) + 1,
      resetTime: now + this.rateLimiter.windowMs,
    });
  }

  public getMetrics() {
    return this.monitoring.getMetrics();
  }
}
