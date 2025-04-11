import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-6">About Veridie</h1>
          <div className="space-y-4">
            <Section title="Student-Centered Approach" content="We believe in personalized guidance that puts your unique goals and aspirations at the center of everything we do." />
            <Section title="Excellence in Mentorship" content="Our mentors are carefully selected from top universities, bringing recent success and relevant experience to guide you." />
            <Section title="Holistic Development" content="Beyond just admissions, we focus on developing skills and confidence that will serve you throughout your academic journey." />
            <Section title="Genuine Care" content="Our mentors are passionate about education and committed to helping you achieve your dreams with authentic support." />
            <Section title="Continuous Learning" content="We stay updated with the latest admissions trends and strategies to provide you with the most current guidance." />
            <Section title="Proven Success" content="Our track record speaks for itself, with countless students achieving their dreams at top institutions." />
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">Why Choose Veridie?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Comparison title="Traditional Consulting" items={["High costs that limit accessibility", "Consultants who graduated decades ago", "One-size-fits-all approach to applications", "Impersonal relationships focused solely on outcomes"]} negative />
              <Comparison title="The Veridie Way" items={["Affordable mentorship packages designed for every budget", "Recent graduates with fresh insights into the current admissions landscape", "Personalized strategies tailored to your unique story and goals", "Genuine mentorship relationships that extend beyond just applications"]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, content }: { title: string; content: string }) => (
  <div className="border-l-4 border-main pl-4">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-700">{content}</p>
  </div>
);

const Comparison = ({ title, items, negative }: { title: string; items: string[]; negative: boolean }) => (
  <div className={`p-4 border-2 ${negative ? 'border-red-500' : 'border-green-500'} rounded-lg`}>
    <h4 className="text-lg font-bold mb-3">{title}</h4>
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, index) => (
        <li key={index} className="text-gray-700">{item}</li>
      ))}
    </ul>
  </div>
);

export default About; 