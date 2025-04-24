"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function SqlExecutorPage() {
  const [sql, setSql] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const executeSQL = async () => {
    if (!sql.trim()) {
      toast({
        title: "Error",
        description: "Please enter SQL to execute",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Execute the SQL
      const { data, error } = await supabase.rpc("exec_sql", { sql })

      if (error) throw error

      setResult(data)
      toast({
        title: "SQL executed",
        description: "SQL executed successfully",
      })
    } catch (error: any) {
      console.error("Error executing SQL:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to execute SQL",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>SQL Executor</CardTitle>
          <CardDescription>Execute SQL queries directly on your Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="Enter SQL query..."
              className="font-mono min-h-[200px]"
            />

            <Button onClick={executeSQL} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                "Execute SQL"
              )}
            </Button>

            {result && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Result:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
