import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production/Vercel, static files are served by Vercel's CDN
  // The serverless function only handles API routes
  // In local development, we serve the files with Vite
  
  console.log(`Static file serving configuration`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`VERCEL: ${process.env.VERCEL}`);
  
  // Only serve static files in local development
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    console.log(`Serving static files locally`);
    const distPath = path.resolve(process.cwd(), "dist", "public");
    
    if (!fs.existsSync(distPath)) {
      throw new Error(
        `Could not find the build directory: ${distPath}, make sure to build the client first`,
      );
    }

    app.use(express.static(distPath));

    // Serve attached_assets as static files
    const assetsPath = path.resolve(process.cwd(), "attached_assets");
    if (fs.existsSync(assetsPath)) {
      app.use("/attached_assets", express.static(assetsPath));
    }

    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    console.log(`Skipping static file serving for Vercel deployment`);
    console.log(`Static files will be served by Vercel's CDN`);
  }
}
