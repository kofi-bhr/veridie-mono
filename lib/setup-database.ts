import { supabase } from "./supabase-client"

export async function setupDatabase() {
  try {
    // Create the exec_sql function
    const { error: execSqlError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          EXECUTE sql;
          RETURN '{"success": true}'::JSONB;
        EXCEPTION WHEN OTHERS THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
          );
        END;
        $$;
      `,
    })

    if (execSqlError) {
      console.error("Error creating exec_sql function:", execSqlError)

      // Try creating it directly with a raw query
      const { error: rawExecSqlError } = await supabase.from("_temp_exec_sql").select("*").limit(1).execute()

      if (rawExecSqlError) {
        throw execSqlError
      }
    }

    // Create the get_table_columns function
    const { error: columnsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
        RETURNS TABLE (
          column_name text,
          data_type text,
          is_nullable text,
          column_default text,
          is_identity text
        )
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN QUERY
          SELECT
            c.column_name::text,
            c.data_type::text,
            c.is_nullable::text,
            c.column_default::text,
            c.is_identity::text
          FROM
            information_schema.columns c
          WHERE
            c.table_schema = 'public'
            AND c.table_name = $1
          ORDER BY
            c.ordinal_position;
        END;
        $$;
      `,
    })

    if (columnsError) {
      console.error("Error creating get_table_columns function:", columnsError)
      throw columnsError
    }

    return { success: true }
  } catch (error) {
    console.error("Error setting up database:", error)
    return { success: false, error }
  }
}
