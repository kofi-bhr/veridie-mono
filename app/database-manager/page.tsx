"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function DatabaseManagerPage() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [columns, setColumns] = useState<any[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

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

  // Fetch columns for the selected table
  useEffect(() => {
    async function fetchColumns() {
      if (!selectedTable) return

      try {
        setLoading(true)

        // This query gets all columns from the selected table
        const { data, error } = await supabase.rpc("get_table_columns", { table_name: selectedTable })

        if (error) throw error

        setColumns(data || [])

        // Reset form data
        setFormData({})
      } catch (err: any) {
        console.error(`Error fetching columns for ${selectedTable}:`, err)
        setError(err.message || `Failed to load columns for ${selectedTable}`)
      } finally {
        setLoading(false)
      }
    }

    fetchColumns()
  }, [selectedTable])

  // Handle form input changes
  const handleInputChange = (column: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTable) return

    try {
      setSubmitting(true)

      // Insert data into the selected table
      const { data, error } = await supabase.from(selectedTable).insert([formData]).select()

      if (error) throw error

      toast({
        title: "Record created",
        description: `Successfully added new record to ${selectedTable}`,
      })

      // Reset form data
      setFormData({})
    } catch (err: any) {
      console.error(`Error inserting data into ${selectedTable}:`, err)
      toast({
        title: "Error",
        description: err.message || `Failed to insert data into ${selectedTable}`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Render form field based on column type
  const renderFormField = (column: any) => {
    const { column_name, data_type, is_nullable } = column
    const isRequired = is_nullable === "NO"

    // Skip primary key columns that are auto-generated
    if (column.is_identity === "YES" || column_name === "id") {
      return null
    }

    switch (data_type) {
      case "text":
      case "character varying":
      case "varchar":
      case "char":
      case "uuid":
        return (
          <div key={column_name} className="space-y-2">
            <Label htmlFor={column_name}>
              {column_name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={column_name}
              value={formData[column_name] || ""}
              onChange={(e) => handleInputChange(column_name, e.target.value)}
              required={isRequired}
            />
          </div>
        )

      case "integer":
      case "bigint":
      case "smallint":
      case "numeric":
      case "decimal":
      case "real":
      case "double precision":
        return (
          <div key={column_name} className="space-y-2">
            <Label htmlFor={column_name}>
              {column_name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={column_name}
              type="number"
              value={formData[column_name] || ""}
              onChange={(e) => handleInputChange(column_name, e.target.value ? Number(e.target.value) : null)}
              required={isRequired}
            />
          </div>
        )

      case "boolean":
        return (
          <div key={column_name} className="space-y-2">
            <Label htmlFor={column_name}>
              {column_name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData[column_name]?.toString() || ""}
              onValueChange={(value) =>
                handleInputChange(column_name, value === "true" ? true : value === "false" ? false : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
                {!isRequired && <SelectItem value="null_value">Null</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        )

      case "json":
      case "jsonb":
        return (
          <div key={column_name} className="space-y-2">
            <Label htmlFor={column_name}>
              {column_name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={column_name}
              value={formData[column_name] ? JSON.stringify(formData[column_name], null, 2) : ""}
              onChange={(e) => {
                try {
                  const value = e.target.value ? JSON.parse(e.target.value) : null
                  handleInputChange(column_name, value)
                } catch (err) {
                  // Allow invalid JSON during typing
                  handleInputChange(column_name, e.target.value)
                }
              }}
              required={isRequired}
              placeholder="{}"
              className="font-mono"
            />
          </div>
        )

      case "timestamp with time zone":
      case "timestamp without time zone":
      case "date":
        return (
          <div key={column_name} className="space-y-2">
            <Label htmlFor={column_name}>
              {column_name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={column_name}
              type="datetime-local"
              value={formData[column_name] || ""}
              onChange={(e) => handleInputChange(column_name, e.target.value)}
              required={isRequired}
            />
          </div>
        )

      default:
        return (
          <div key={column_name} className="space-y-2">
            <Label htmlFor={column_name}>
              {column_name} ({data_type}) {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={column_name}
              value={formData[column_name] || ""}
              onChange={(e) => handleInputChange(column_name, e.target.value)}
              required={isRequired}
            />
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Manager</CardTitle>
          <CardDescription>Create new records in your Supabase database</CardDescription>
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
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TabsContent value={selectedTable || ""}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {columns.map((column) => renderFormField(column))}

                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Record"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
