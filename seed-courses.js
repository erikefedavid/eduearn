import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DUMMY_COURSES = [
  {
    title: "Nigerian Tax Law & Compliance",
    description: "Master the complexities of Nigerian tax regulations, FIRS guidelines, and corporate compliance strategies.",
    category: "Law",
    price: 15000,
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop",
    is_published: true
  },
  {
    title: "Data Analytics with Python",
    description: "Learn data wrangling, visualization, and machine learning fundamentals using Python and Pandas.",
    category: "Technology",
    price: 25000,
    thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    is_published: true
  },
  {
    title: "Petroleum Engineering Fundamentals",
    description: "Core principles of upstream oil and gas operations, reservoir management, and drilling technologies.",
    category: "Engineering",
    price: 30000,
    thumbnail_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
    is_published: true
  },
  {
    title: "Clinical Pharmacology",
    description: "Advanced pharmacokinetics, drug interactions, and evidence-based prescribing for healthcare professionals.",
    category: "Medicine",
    price: 35000,
    thumbnail_url: "https://images.unsplash.com/photo-1505751172107-597d5a4d4b1b?q=80&w=2070&auto=format&fit=crop",
    is_published: true
  },
  {
    title: "Entrepreneurship & Venture Capital",
    description: "Build scalable startups, pitch to investors, and navigate the African venture capital landscape.",
    category: "Business",
    price: 20000,
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    is_published: true
  }
];

async function run() {
  console.log("Fetching instructors...");
  const { data: profiles, error } = await supabase.from('profiles').select('id, role').eq('role', 'instructor');
  
  if (error || !profiles || profiles.length === 0) {
    console.error("No instructors found in database. Please log in or create an instructor account first.");
    return;
  }
  
  const instructorId = profiles[0].id;
  console.log("Seeding dummy courses for instructor:", instructorId);

  for (const course of DUMMY_COURSES) {
    const { data: inserted, error: insertError } = await supabase.from('courses').insert({
      ...course,
      instructor_id: instructorId
    }).select();
    
    if (insertError) {
      console.error("Failed to insert:", course.title, insertError);
    } else {
      console.log("Inserted:", inserted[0].title);
      
      // Insert a dummy chapter for each so it has content
      await supabase.from('chapters').insert({
        course_id: inserted[0].id,
        title: "Introduction & Foundations",
        description: "Welcome to the first module of the course.",
        position: 1
      });
    }
  }
  
  console.log("Seeding complete!");
}

run();
