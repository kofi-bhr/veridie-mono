import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import ConsultantProfile from '@/components/consultant/ConsultantProfile';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  
  // Default metadata in case of error
  const defaultMetadata = {
    title: 'Consultant Profile | Veridie',
    description: 'View the profile of this college consultant on Veridie.',
  };
  
  try {
    // Fetch consultant data from Supabase
    const supabase = createClient();
    const { data: consultant, error } = await supabase
      .from('consultants')
      .select(`
        id,
        slug,
        headline,
        user_id
      `)
      .eq('slug', slug)
      .single();
    
    if (error || !consultant) {
      console.error('Error in generateMetadata:', error);
      return defaultMetadata;
    }
    
    // Fetch profile data separately
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', consultant.user_id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile in generateMetadata:', profileError);
    }
    
    const firstName = profileData?.first_name || '';
    const lastName = profileData?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return {
      title: `${fullName || 'Consultant'} - College Consultant | Veridie`,
      description: consultant.headline || 'College consultant profile on Veridie.',
      openGraph: {
        title: `${fullName || 'Consultant'} - College Consultant | Veridie`,
        description: consultant.headline || 'College consultant profile on Veridie.',
        type: 'profile',
      },
    };
  } catch (err) {
    console.error('Error in generateMetadata:', err);
    return defaultMetadata;
  }
}

export default async function ConsultantProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    console.log(`Fetching consultant with slug: ${slug}`);
    
    // Initialize Supabase client
    const supabase = createClient();
    if (!supabase) {
      console.error('Failed to create Supabase client');
      throw new Error('Database connection failed');
    }
    
    // Check if the slug exists in the consultants table
    console.log('Checking if slug exists...');
    const { data: slugCheck, error: slugError } = await supabase
      .from('consultants')
      .select('id, slug')
      .eq('slug', slug);
    
    if (slugError) {
      console.error('Error checking slug:', JSON.stringify(slugError));
      throw new Error(`Slug check failed: ${slugError.message}`);
    }
    
    if (!slugCheck || slugCheck.length === 0) {
      console.error(`Consultant not found with slug: ${slug}`);
      return notFound();
    }
    
    console.log(`Found consultant with ID: ${slugCheck[0].id}`);
    const consultantId = slugCheck[0].id;
    
    // Fetch consultant data from Supabase
    console.log('Fetching full consultant data...');
    const { data: consultant, error } = await supabase
      .from('consultants')
      .select(`
        id,
        slug,
        university,
        headline,
        image_url,
        major,
        accepted_schools,
        sat_score,
        sat_reading,
        sat_math,
        act_composite,
        act_english,
        act_math,
        act_reading,
        act_science,
        gpa_score,
        gpa_scale,
        is_weighted,
        user_id
      `)
      .eq('slug', slug)
      .single();
    
    // Handle errors or missing consultant
    if (error) {
      console.error('Error fetching consultant:', JSON.stringify(error));
      throw new Error(`Consultant fetch failed: ${error.message}`);
    }
    
    if (!consultant) {
      console.error('Consultant data is null or undefined');
      return notFound();
    }
    
    console.log('Successfully fetched consultant data');
    
    // Fetch profile data separately
    console.log('Fetching profile data...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, is_verified, role')
      .eq('id', consultant.user_id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', JSON.stringify(profileError));
    }
    
    // Fetch awards data
    console.log('Fetching awards data...');
    const { data: awards, error: awardsError } = await supabase
      .from('awards')
      .select('id, title, description, date')
      .eq('consultant_id', consultantId);
    
    if (awardsError) {
      console.error('Error fetching awards:', JSON.stringify(awardsError));
    }
    
    // Fetch extracurriculars data with bulletproof error handling
    console.log('Fetching extracurriculars data for consultant ID:', consultantId);
    let extracurricularsData = [];
    
    try {
      // Simple query with error handling
      const { data, error } = await supabase
        .from('extracurriculars')
        .select('*')
        .eq('consultant_id', consultantId);
      
      if (error) {
        console.error('Error fetching extracurriculars:', JSON.stringify(error));
      } else {
        console.log('Extracurriculars query result:', data ? `Found ${data.length} records` : 'No data returned');
        
        // Only use the data if it exists and has items
        if (data && Array.isArray(data) && data.length > 0) {
          extracurricularsData = data;
        } else {
          console.log('No extracurriculars found for this consultant');
        }
      }
    } catch (err) {
      console.error('Exception in extracurriculars query:', err);
    }

    // Fetch AP scores data
    console.log('Fetching AP scores data...');
    const { data: apScores, error: apScoresError } = await supabase
      .from('ap_scores')
      .select('id, subject, score')
      .eq('consultant_id', consultantId);
    
    if (apScoresError) {
      console.error('Error fetching AP scores:', JSON.stringify(apScoresError));
    }
    
    // Fetch packages data
    console.log('Fetching packages data...');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('id, title, price, features, billing_frequency')
      .eq('consultant_id', consultantId)
      .eq('is_visible', true)
      .order('position', { ascending: true });
    
    if (packagesError) {
      console.error('Error fetching packages:', JSON.stringify(packagesError));
    }
    
    // Fetch universities data for accepted schools
    console.log('Fetching universities data...');
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, name, logo_url, color_hex');
    
    if (uniError) {
      console.error('Error fetching universities:', JSON.stringify(uniError));
      // Continue without universities data
    }
    
    console.log('Processing consultant data for rendering...');
    
    // Create a properly formatted consultant object that matches the expected structure
    const processedConsultant = {
      ...consultant,
      // Add verification status based on profile data
      is_verified: profileData?.is_verified || false,
      // Format GPA for display
      gpa: consultant.gpa_score !== null ? 
        (consultant.gpa_scale ? consultant.gpa_score / consultant.gpa_scale * 4.0 : consultant.gpa_score) : 
        undefined,
      // Add profile data
      profiles: {
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        email: ''  // Email not available in profiles table
      },
      // Add bio field with default value
      bio: '',
      // Add related data with fallbacks
      awards: awards?.map(award => ({
        id: award.id,
        title: award.title || 'Untitled Award',
        description: award.description || '',
        year: award.date || ''  // Map date to year for compatibility
      })) || [],
      essays: [],  // No essays table data available
      extracurriculars: Array.isArray(extracurricularsData) && extracurricularsData.length > 0 
        ? extracurricularsData.map(ec => {
            // Ensure we have an ID
            const id = ec?.id || `ec-${Math.random().toString(36).substring(2, 9)}`;
            
            // Extract title from the appropriate field
            let title = 'Untitled Activity';
            if (typeof ec === 'object' && ec !== null) {
              if (ec.position_name) title = ec.position_name;
              else if (ec.title) title = ec.title;
              else if (ec.name) title = ec.name;
              else if (ec.activity) title = ec.activity;
            }
            
            // Return the formatted extracurricular with safe fallbacks
            return {
              id,
              title,
              description: ec?.description || '',
              role: ec?.role || '',
              institution: ec?.institution || '',
              years: Array.isArray(ec?.years) ? ec.years : []
            };
          })
        : [], // Return empty array if no data
      ap_scores: apScores || [],
      packages: packages?.map(pkg => ({
        ...pkg,
        description: pkg.billing_frequency === 'one_time' ? 'One-time payment' : 'Recurring payment'
      })) || [],
      // Ensure arrays are properly initialized
      major: consultant.major || [],
      accepted_schools: consultant.accepted_schools || []
    };
    
    console.log('Rendering consultant profile...');
    
    return (
      <ConsultantProfile 
        consultant={processedConsultant} 
        universities={universities || []} 
      />
    );
  } catch (err) {
    console.error('Unexpected error in ConsultantProfilePage:', err);
    return notFound();
  }
}

// Helper function to safely extract values from an object using multiple possible keys
function extractValue(obj: any, possibleKeys: string[]): string | null {
  if (!obj) return null;
  
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  
  return null;
}
