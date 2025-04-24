"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function DatabaseExplorerPage() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available tables
  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true)

        // This query gets all tables from the public schema
        const { data, error } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

        if (error) throw error

        const tableNames = data?.map((table) => table.tablename) || []
        setTables(tableNames)

        // Select the first table by default
        if (tableNames.length > 0 && !selectedTable) {
          setSelectedTable(tableNames[0])
        }
      } catch (err: any) {
        console.error("Error fetching tables:", err)
        setError(err.message || "Failed to load tables")
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [selectedTable])

  // Fetch data for the selected table
  useEffect(() => {
    async function fetchTableData() {
      if (!selectedTable) return

      try {
        setLoading(true)

        // Fetch all rows from the selected table
        const { data, error } = await supabase.from(selectedTable).select("*").limit(50)

        if (error) throw error

        setTableData(data || [])
      } catch (err: any) {
        console.error(`Error fetching data from ${selectedTable}:`, err)
        setError(err.message || `Failed to load data from ${selectedTable}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTableData()
  }, [selectedTable])

  // Function to render table data
  const renderTableData = () => {
    if (tableData.length === 0) {
      return <p className="text-center text-muted-foreground py-4">No data found in this table</p>
    }

    // Get all unique keys from all objects
    const allKeys = Array.from(new Set(tableData.flatMap((item) => Object.keys(item))))

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              {allKeys.map((key) => (
                <th key={key} className="p-2 text-left border border-border">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/50">
                {allKeys.map((key) => (
                  <td key={`${rowIndex}-${key}`} className="p-2 border border-border">
                    {renderCellValue(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Function to render cell values based on their type
  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">null</span>
    }

    if (typeof value === "object") {
      return <span className="text-xs">{JSON.stringify(value)}</span>
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false"
    }

    return String(value)
  }

  if (loading && tables.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Explorer</CardTitle>
            <CardDescription>Loading database tables...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && tables.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Explorer</CardTitle>
            <CardDescription className="text-red-500">Error loading database</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Explorer</CardTitle>
          <CardDescription>Explore your Supabase database tables</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No tables found in the database</p>
          ) : (
            <Tabs value={selectedTable || undefined} onValueChange={setSelectedTable}>
              <TabsList className="mb-4 overflow-x-auto">
                {tables.map((table) => (
                  <TabsTrigger key={table} value={table}>
                    {table}
                  </TabsTrigger>
                ))}
              </TabsList>

              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <TabsContent value={selectedTable || ""}>{renderTableData()}</TabsContent>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
