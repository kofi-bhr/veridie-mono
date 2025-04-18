import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExperienceSectionProps {
  form: {
    register: any;
    errors: any;
  };
}

export default function ExperienceSection({ form }: ExperienceSectionProps) {
  const { register, errors } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            {...register('headline')}
            placeholder="e.g. College Admissions Consultant & Essay Coach"
          />
          {errors.headline && (
            <p className="text-red-500 text-sm mt-1">{errors.headline.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="experience">Experience</Label>
          <Textarea
            id="experience"
            {...register('experience')}
            placeholder="Share your relevant experience in college admissions consulting..."
            className="min-h-[150px]"
          />
          {errors.experience && (
            <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="achievements">Notable Achievements</Label>
          <Textarea
            id="achievements"
            {...register('achievements')}
            placeholder="List your key achievements and qualifications..."
            className="min-h-[150px]"
          />
          {errors.achievements && (
            <p className="text-red-500 text-sm mt-1">{errors.achievements.message}</p>
          )}
        </div>
      </div>
    </div>
  );
} 