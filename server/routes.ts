import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server | null,
  app: Express
): Promise<void> {
  // Application routes (prefixed with /api)
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Krishna Electronics API",
    });
  });

  // Fetch product image from URL or product page
  app.get("/api/fetch-product-image", async (req, res) => {
    try {
      const url = req.query.url as string;
      
      if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      // Check if it's a direct image URL
      if (isImageUrl(url)) {
        return res.json({ imageUrl: url, source: "direct" });
      }

      // If it's a product page, try to fetch and extract image
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        const html = await response.text();
        const imageUrl = extractProductImage(html, url);

        if (imageUrl) {
          return res.json({ imageUrl, source: "extracted" });
        } else {
          return res.status(404).json({ 
            error: "Could not find product image on the page",
            suggestion: "Please try a direct image URL or upload an image manually"
          });
        }
      } catch (fetchError) {
        console.error("Error fetching product page:", fetchError);
        return res.status(500).json({ 
          error: "Failed to fetch product page",
          suggestion: "Please try a direct image URL or upload an image manually"
        });
      }
    } catch (error) {
      console.error("Error in fetch-product-image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
}

// Helper function to check if URL is a direct image
function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

// Helper function to extract product image from HTML
function extractProductImage(html: string, baseUrl: string): string | null {
  // Try to find og:image first
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (ogImageMatch && ogImageMatch[1]) {
    return resolveUrl(ogImageMatch[1], baseUrl);
  }

  // Try to find product image in common patterns
  const productImagePatterns = [
    /<img[^>]*class=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
    /<img[^>]*class=["'][^"']*main[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
    /<img[^>]*class=["'][^"']*primary[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
    /<img[^>]*alt=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of productImagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return resolveUrl(match[1], baseUrl);
    }
  }

  // Fallback: try to find the first reasonably sized image
  const allImages = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
  if (allImages && allImages.length > 0) {
    for (const imgTag of allImages) {
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        const imageUrl = resolveUrl(srcMatch[1], baseUrl);
        // Skip very small images (likely icons)
        if (!imageUrl.includes('icon') && !imageUrl.includes('logo') && !imageUrl.includes('favicon')) {
          return imageUrl;
        }
      }
    }
  }

  return null;
}

// Helper function to resolve relative URLs
function resolveUrl(url: string, baseUrl: string): string {
  try {
    // If URL is already absolute, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Otherwise, resolve relative to base URL
    const base = new URL(baseUrl);
    return new URL(url, base).href;
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}
