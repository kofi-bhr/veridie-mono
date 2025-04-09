// Script to check database structure
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szrjslapdbnzvhtdkbep.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmpzbGFwZGJuenZodGRrYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczODgyMDgsImV4cCI6MjA1Mjk2NDIwOH0.B2Q6KZzGaCDK1c3rVWkY6LIa6yg1Wajg7xW0uLC85gI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable(tableName) {
  console.log(`\nChecking ${tableName} table...`);
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error accessing ${tableName} table:`, error);
      return;
    }
    
    console.log(`${tableName} table exists.`);
    if (data && data.length > 0) {
      console.log(`Sample ${tableName} data:`, JSON.stringify(data[0], null, 2));
      console.log(`${tableName} columns:`, Object.keys(data[0]).join(', '));
    } else {
      console.log(`No records found in ${tableName} table.`);
    }
  } catch (err) {
    console.error(`Error checking ${tableName} table:`, err);
  }
}

async function checkDatabase() {
  console.log('Checking database structure...');
  
  try {
    // Check all relevant tables
    await checkTable('consultants');
    await checkTable('profiles');
    await checkTable('universities');
    await checkTable('awards');
    await checkTable('essays');
    await checkTable('extracurriculars');
    await checkTable('ap_scores');
    await checkTable('packages');
    
    // List all tables in the database
    console.log('\nListing all tables in the database...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('list_tables');
    
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
    } else {
      console.log('Tables in the database:', tables);
      
      // Get schema information
      const { data: schema, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('table_name, column_name, data_type')
        .in('table_name', [
          'consultants', 'profiles', 'universities', 
          'awards', 'essays', 'extracurriculars', 
          'ap_scores', 'packages'
        ]);
      
      if (schemaError) {
        console.error('Error fetching schema information:', schemaError);
      } else if (schema) {
        // Group columns by table
        const tableSchema = {};
        schema.forEach(col => {
          if (!tableSchema[col.table_name]) {
            tableSchema[col.table_name] = [];
          }
          tableSchema[col.table_name].push({
            column: col.column_name,
            type: col.data_type
          });
        });
        
        console.log('\nDetailed schema information:');
        Object.keys(tableSchema).forEach(table => {
          console.log(`\n${table} table columns:`);
          tableSchema[table].forEach(col => {
            console.log(`  ${col.column}: ${col.type}`);
          });
        });
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabase()
  .then(() => {
    console.log('\nDatabase check complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
