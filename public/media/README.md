# public/media

Real photography for the channel post previews.

Drop a file here named after the media key, in as many formats as you have:

    summer-ac.avif      (best compression — optional)
    summer-ac.webp      (wide support — optional)
    summer-ac.jpg       (required fallback; .jpeg or .png also accepted)

Rebuild and the previews switch from the built-in illustration to your photo.
No markup or CSS changes are needed — `src/lib/media.mjs` picks the best format
the browser supports via `<picture>`, lazy-loads it, and keeps the per-platform
aspect ratio (square for Instagram, 1.91:1 for link cards).

Keys currently in use are listed in `channelDemo.outputs[].media` in
`src/data/site.mjs`.

Two rules:

- **Crop square.** The Instagram preview is 1:1 and the link cards crop from the
  centre, so a square master works everywhere. 1200×1200 or larger.
- **Check the licence.** These are marketing pages; a photo needs a licence that
  covers commercial use. Keep the licence note next to the file.
