import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ConsultantProfile from '@/components/consultant/ConsultantProfile';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add cache control headers through Next.js config
export const fetchCache = 'force-no-store';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerClient();
  const { slug } = params;
  
  // Default metadata in case of error
  const defaultMetadata = {
    title: 'Mentor Profile | Veridie',
    description: 'View this mentor\'s profile on Veridie',
  };

  try {
    const { data: consultant } = await supabase
      .from('consultants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!consultant) {
      return defaultMetadata;
    }

    return {
      title: `${consultant.first_name} ${consultant.last_name} | Veridie Mentor`,
      description: consultant.headline || defaultMetadata.description,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return defaultMetadata;
  }
}

async function fetchConsultantData(slug: string) {
  const supabase = createServerClient();
  
  // Check if the slug exists in the consultants table
  const { data: slugCheck, error: slugError } = await supabase
    .from('consultants')
    .select('id, slug')
    .eq('slug', slug);
  
  if (slugError || !slugCheck || slugCheck.length === 0) {
    return null;
  }
  
  const consultantId = slugCheck[0].id;
  
  // Fetch all the necessary data
  const [
    consultantResult,
    profileResult,
    awardsResult,
    extracurricularsResult,
    apScoresResult,
    packagesResult,
    universitiesResult
  ] = await Promise.all([
    supabase
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
      .single(),
    supabase
      .from('profiles')
      .select('first_name, last_name, is_verified, role')
      .eq('id', slugCheck[0].user_id)
      .single(),
    supabase
      .from('awards')
      .select('id, title, description, date')
      .eq('consultant_id', consultantId),
    supabase
      .from('extracurriculars')
      .select('*')
      .eq('consultant_id', consultantId),
    supabase
      .from('ap_scores')
      .select('id, subject, score')
      .eq('consultant_id', consultantId),
    supabase
      .from('packages')
      .select('id, title, price, features, billing_frequency')
      .eq('consultant_id', consultantId)
      .eq('is_visible', true)
      .order('position', { ascending: true }),
    supabase
      .from('universities')
      .select('id, name, logo_url, color_hex')
  ]);

  return {
    consultant: consultantResult.data,
    profile: profileResult.data,
    awards: awardsResult.data,
    extracurriculars: extracurricularsResult.data,
    apScores: apScoresResult.data,
    packages: packagesResult.data,
    universities: universitiesResult.data
  };
}

export default async function ConsultantProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = await fetchConsultantData(slug);
  
  if (!data || !data.consultant) {
    return notFound();
  }
  
  const processedConsultant = {
    ...data.consultant,
    is_verified: data.profile?.is_verified || false,
    gpa: data.consultant.gpa_score !== null ? 
      (data.consultant.gpa_scale ? data.consultant.gpa_score / data.consultant.gpa_scale * 4.0 : data.consultant.gpa_score) : 
      undefined,
    profiles: {
      first_name: data.profile?.first_name || '',
      last_name: data.profile?.last_name || '',
      email: ''
    },
    bio: '',
    awards: data.awards?.map(award => ({
      id: award.id,
      title: award.title || 'Untitled Award',
      description: award.description || '',
      year: award.date || ''
    })) || [],
    essays: [],
    extracurriculars: Array.isArray(data.extracurriculars) ? data.extracurriculars.map(ec => ({
      id: ec?.id || `ec-${Math.random().toString(36).substring(2, 9)}`,
      title: ec?.position_name || ec?.title || ec?.name || ec?.activity || 'Untitled Activity',
      description: ec?.description || '',
      role: ec?.role || '',
      institution: ec?.institution || '',
      years: Array.isArray(ec?.years) ? ec.years : []
    })) : [],
    ap_scores: data.apScores || [],
    packages: data.packages?.map(pkg => ({
      ...pkg,
      description: pkg.billing_frequency === 'one_time' ? 'One-time payment' : 'Recurring payment'
    })) || [],
    major: data.consultant.major || [],
    accepted_schools: data.consultant.accepted_schools || []
  };
  
  return (
    <ConsultantProfile 
      consultant={processedConsultant} 
      universities={data.universities || []} 
    />
  );
}

