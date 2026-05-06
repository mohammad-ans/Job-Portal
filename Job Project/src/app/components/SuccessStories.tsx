import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, Building, GraduationCap, Quote } from "lucide-react";
import { api } from "../lib/api";

interface Story {
  id: string;
  name: string;
  role: string;
  company: string;
  story_type: string;
  content: string;
  avatar_url: string | null;
}

const FALLBACK_IMAGES: Record<string, string> = {
  student: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  employer: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export function SuccessStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: Story[] }>("/api/v1/content/success-stories", false)
      .then((data) => setStories(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Success Stories</h1>
        <p className="text-lg text-slate-600">See how GradMatch AI is transforming entry-level hiring for both students and employers.</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse h-64" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative"
            >
              <Quote className="absolute top-6 right-6 text-slate-100 rotate-180" size={64} />
              <div className="relative z-10">
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={18} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 italic mb-8 leading-relaxed">"{story.content}"</p>

                <div className="flex items-center gap-4 mt-auto">
                  <img
                    src={story.avatar_url ?? FALLBACK_IMAGES[story.story_type] ?? FALLBACK_IMAGES.student}
                    alt={story.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{story.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      {story.story_type === "student" ? <GraduationCap size={14} /> : <Building size={14} />}
                      {story.role} at {story.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
