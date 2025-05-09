import type React from "react"

/**
 * Gets the appropriate image URL for a profile
 * Now that the bucket is public, we can use the direct Supabase URL
 */
export function getProfileImageUrl(url: string | null | undefined): string {
  if (!url) return "/diverse-avatars.png"

  // If it's already a local URL, return it as is
  if (url.startsWith("/")) return url

  // Return the URL directly now that the bucket is public
  return url
}

/**
 * For backward compatibility - alias to getProfileImageUrl
 * This ensures any existing code that uses getProxiedImageUrl still works
 */
export const getProxiedImageUrl = getProfileImageUrl

/**
 * Creates an initials avatar from a name
 * This is used as a fallback when images fail to load
 */
export function getInitials(name: string): string {
  if (!name) return "?"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Handle image loading errors
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc = "/diverse-avatars.png",
): void {
  console.error(`Failed to load image: ${e.currentTarget.src}`)
  e.currentTarget.src = fallbackSrc
}
