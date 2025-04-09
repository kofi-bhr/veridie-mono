// Script to add a test consultant to the database
const { createClient } = require('../src/lib/supabase/client');

async function addTestConsultant() {
  const supabase = createClient();
  
  console.log('Adding test consultant to database...');
  
  // First, check if the test consultant already exists
  const { data: existingConsultant } = await supabase
    .from('consultants')
    .select('id, slug')
    .eq('slug', 'test-consultant')
    .single();
  
  if (existingConsultant) {
    console.log('Test consultant already exists with ID:', existingConsultant.id);
    return existingConsultant.id;
  }
  
  // Create a profile for the consultant
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com'
    })
    .select('id')
    .single();
  
  if (profileError) {
    console.error('Error creating profile:', profileError);
    return null;
  }
  
  console.log('Created profile with ID:', profile.id);
  
  // Create the consultant
  const { data: consultant, error: consultantError } = await supabase
    .from('consultants')
    .insert({
      slug: 'test-consultant',
      user_id: profile.id,
      university: 'Harvard University',
      headline: 'Harvard student specializing in college admissions',
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      bio: 'I am a current Harvard student with experience in college admissions. I can help you with your application essays, interview preparation, and overall application strategy.',
      major: ['Computer Science', 'Economics'],
      accepted_schools: ['harvard', 'yale', 'stanford'],
      is_verified: true,
      sat_score: 1560,
      act_score: 35,
      gpa: 4.0
    })
    .select('id')
    .single();
  
  if (consultantError) {
    console.error('Error creating consultant:', consultantError);
    return null;
  }
  
  console.log('Created consultant with ID:', consultant.id);
  
  // Add some awards
  const { error: awardsError } = await supabase
    .from('awards')
    .insert([
      {
        consultant_id: consultant.id,
        title: 'National Merit Scholar',
        description: 'Awarded to top 1% of PSAT test takers nationwide',
        year: '2022'
      },
      {
        consultant_id: consultant.id,
        title: 'Presidential Scholar',
        description: 'Recognized for academic excellence and community service',
        year: '2023'
      }
    ]);
  
  if (awardsError) {
    console.error('Error adding awards:', awardsError);
  } else {
    console.log('Added awards for consultant');
  }
  
  // Add some essays
  const { error: essaysError } = await supabase
    .from('essays')
    .insert([
      {
        consultant_id: consultant.id,
        title: 'My Harvard Application Essay',
        preview: 'This is the essay that got me into Harvard. It focuses on my personal growth through...',
        content: 'The full content of my Harvard application essay that discusses my personal journey and growth through various challenges I faced in high school...',
        is_locked: false
      },
      {
        consultant_id: consultant.id,
        title: 'My Stanford Application Essay',
        preview: 'A preview of my Stanford essay about innovation and creativity...',
        content: 'The complete Stanford essay discussing my passion for innovation and how I developed creative solutions to problems in my community...',
        is_locked: true
      }
    ]);
  
  if (essaysError) {
    console.error('Error adding essays:', essaysError);
  } else {
    console.log('Added essays for consultant');
  }
  
  // Add some extracurriculars
  const { error: extracurricularsError } = await supabase
    .from('extracurriculars')
    .insert([
      {
        consultant_id: consultant.id,
        title: 'Student Government',
        description: 'Led initiatives to improve campus sustainability and mental health resources',
        role: 'President',
        years: ['2021', '2022']
      },
      {
        consultant_id: consultant.id,
        title: 'Debate Team',
        description: 'Competed in national tournaments and won regional championships',
        role: 'Team Captain',
        years: ['2020', '2021', '2022']
      }
    ]);
  
  if (extracurricularsError) {
    console.error('Error adding extracurriculars:', extracurricularsError);
  } else {
    console.log('Added extracurriculars for consultant');
  }
  
  // Add some AP scores
  const { error: apScoresError } = await supabase
    .from('ap_scores')
    .insert([
      {
        consultant_id: consultant.id,
        subject: 'Calculus BC',
        score: 5
      },
      {
        consultant_id: consultant.id,
        subject: 'Physics C: Mechanics',
        score: 5
      },
      {
        consultant_id: consultant.id,
        subject: 'English Literature',
        score: 4
      },
      {
        consultant_id: consultant.id,
        subject: 'US History',
        score: 5
      }
    ]);
  
  if (apScoresError) {
    console.error('Error adding AP scores:', apScoresError);
  } else {
    console.log('Added AP scores for consultant');
  }
  
  // Add some packages
  const { error: packagesError } = await supabase
    .from('packages')
    .insert([
      {
        consultant_id: consultant.id,
        title: 'Essay Review',
        description: 'Comprehensive review and feedback on your college application essays',
        price: 99,
        features: [
          'Detailed feedback on up to 3 essays',
          'Grammar and style suggestions',
          'Content and structure recommendations',
          '48-hour turnaround time'
        ]
      },
      {
        consultant_id: consultant.id,
        title: 'Application Strategy',
        description: 'Complete guidance on your college application strategy',
        price: 199,
        features: [
          'College selection recommendations',
          'Application timeline planning',
          'Extracurricular activity optimization',
          'Two 1-hour strategy sessions'
        ]
      },
      {
        consultant_id: consultant.id,
        title: 'Complete Package',
        description: 'End-to-end support for your college application journey',
        price: 499,
        features: [
          'Everything in Essay Review and Application Strategy',
          'Interview preparation',
          'Unlimited email support',
          'Four 1-hour consultation sessions',
          'Final application review'
        ]
      }
    ]);
  
  if (packagesError) {
    console.error('Error adding packages:', packagesError);
  } else {
    console.log('Added packages for consultant');
  }
  
  console.log('Test consultant added successfully!');
  return consultant.id;
}

addTestConsultant()
  .then(id => {
    if (id) {
      console.log('Test consultant created with ID:', id);
      console.log('You can now visit: http://localhost:3000/mentors/test-consultant');
    } else {
      console.log('Failed to create test consultant');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
