import { createClient } from '@/lib/supabase/client';

export default async function TestPage() {
  // Use client-side Supabase client since we're having issues with the server client
  const supabase = createClient();
  
  // Fetch consultants data
  const { data: consultants, error: consultantsError } = await supabase
    .from('consultants')
    .select('*')
    .limit(5);
  
  // Fetch universities data
  const { data: universities, error: universitiesError } = await supabase
    .from('universities')
    .select('*')
    .limit(5);
  
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6">Database Test Page</h1>
      
      <div className="mb-10 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Consultants</h2>
        {consultantsError ? (
          <div className="text-red-500">
            <p>Error: {consultantsError.message}</p>
            <p>Code: {consultantsError.code}</p>
            <p>Details: {JSON.stringify(consultantsError.details)}</p>
          </div>
        ) : consultants && consultants.length > 0 ? (
          <div>
            <p className="mb-4">Found {consultants.length} consultants</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-left">ID</th>
                    <th className="border border-black p-2 text-left">Slug</th>
                    <th className="border border-black p-2 text-left">University</th>
                    <th className="border border-black p-2 text-left">Headline</th>
                    <th className="border border-black p-2 text-left">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {consultants.map((consultant) => (
                    <tr key={consultant.id}>
                      <td className="border border-black p-2">{consultant.id}</td>
                      <td className="border border-black p-2">{consultant.slug}</td>
                      <td className="border border-black p-2">{consultant.university}</td>
                      <td className="border border-black p-2">{consultant.headline}</td>
                      <td className="border border-black p-2">
                        {'is_verified' in consultant 
                          ? consultant.is_verified ? 'Yes' : 'No'
                          : 'verified' in consultant 
                            ? consultant.verified ? 'Yes' : 'No'
                            : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Sample Consultant Structure:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(Object.keys(consultants[0]), null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p>No consultants found in the database.</p>
        )}
      </div>
      
      <div className="mb-10 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Universities</h2>
        {universitiesError ? (
          <div className="text-red-500">
            <p>Error: {universitiesError.message}</p>
            <p>Code: {universitiesError.code}</p>
            <p>Details: {JSON.stringify(universitiesError.details)}</p>
          </div>
        ) : universities && universities.length > 0 ? (
          <div>
            <p className="mb-4">Found {universities.length} universities</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-left">ID</th>
                    <th className="border border-black p-2 text-left">Name</th>
                    <th className="border border-black p-2 text-left">Logo URL</th>
                    <th className="border border-black p-2 text-left">Color Hex</th>
                  </tr>
                </thead>
                <tbody>
                  {universities.map((university) => (
                    <tr key={university.id}>
                      <td className="border border-black p-2">{university.id}</td>
                      <td className="border border-black p-2">{university.name}</td>
                      <td className="border border-black p-2">{university.logo_url}</td>
                      <td className="border border-black p-2" style={{backgroundColor: university.color_hex}}>
                        {university.color_hex}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Sample University Structure:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(Object.keys(universities[0]), null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p>No universities found in the database.</p>
        )}
      </div>
    </div>
  );
}
