import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function DebugMentorsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch all mentors
  const { data: mentors, error } = await supabase
    .from("mentors")
    .select(`
      id,
      profiles(name)
    `)
    .order("id")

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Mentors</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          <p>Error: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Mentors</h1>
      <p className="mb-4">Total mentors: {mentors?.length || 0}</p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mentors?.map((mentor) => (
              <tr key={mentor.id}>
                <td className="px-4 py-2 border font-mono text-sm">{mentor.id}</td>
                <td className="px-4 py-2 border">{mentor.profiles?.name || "No name"}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2">
                    <Link
                      href={`/mentors/${mentor.id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/api/debug-mentor/${mentor.id}`}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      target="_blank"
                    >
                      API Debug
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {(!mentors || mentors.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-2 border text-center">
                  No mentors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
