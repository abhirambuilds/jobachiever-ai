import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, FolderGit2, ExternalLink, Github, ArrowRight, ArrowLeft } from 'lucide-react';
import { projectItemSchema } from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ProjectsForm({ onNext, onBack }) {
  const { profile, addProject, removeProject } = useProfile();
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectItemSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      problemSolved: '',
      technologies: '',
      githubUrl: '',
      liveDemoUrl: '',
      role: '',
      keyAchievements: '',
      startDate: '',
      endDate: '',
    },
    mode: 'onTouched',
  });

  const onAddSubmit = (data) => {
    addProject(data);
    reset();
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Step 5: Featured Projects & Portfolio
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Highlight technical capstones, open-source work, and commercial projects.
          </p>
        </div>
        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </Button>
        )}
      </div>

      {/* Existing Projects List */}
      <div className="space-y-3">
        {profile.projects.map((item) => (
          <Card key={item.id} className="border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                    {item.role && (
                      <span className="text-xs font-medium text-muted-foreground">
                        ({item.role})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {item.problemSolved && (
                    <p className="text-xs text-foreground/85">
                      <span className="font-semibold text-primary">Problem Solved:</span>{' '}
                      {item.problemSolved}
                    </p>
                  )}

                  {item.technologies && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.technologies.split(',').map((tech) => (
                        <span
                          key={tech.trim()}
                          className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs pt-1">
                    {item.githubUrl && (
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Github className="h-3.5 w-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}
                    {item.liveDemoUrl && (
                      <a
                        href={item.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeProject(item.id)}
                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                aria-label="Remove project"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {profile.projects.length === 0 && !isAdding && (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/20">
            <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">No projects added yet.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Project</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add New Project Form */}
      {isAdding && (
        <Card className="border-primary/40 bg-card shadow-md animate-in fade-in-50 duration-200">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span>New Project Record</span>
            </h4>

            <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Project Title *"
                  placeholder="e.g. JobAchiever AI Monorepo"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Technologies Used *"
                  placeholder="e.g. React, Spring Boot, PostgreSQL, Docker"
                  error={errors.technologies?.message}
                  {...register('technologies')}
                />

                <Input
                  label="Your Role / Contribution"
                  placeholder="e.g. Lead Architect, Full-Stack Contributor"
                  error={errors.role?.message}
                  {...register('role')}
                />

                <Input
                  label="Key Achievements / Impact"
                  placeholder="e.g. Handled 500k queries with sub-50ms latency"
                  error={errors.keyAchievements?.message}
                  {...register('keyAchievements')}
                />

                <Input
                  label="GitHub Repository URL"
                  placeholder="https://github.com/..."
                  error={errors.githubUrl?.message}
                  {...register('githubUrl')}
                />

                <Input
                  label="Live Demo / Deployment URL"
                  placeholder="https://myproject.com"
                  error={errors.liveDemoUrl?.message}
                  {...register('liveDemoUrl')}
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Project Description *"
                    placeholder="Provide a concise overview of what the application does..."
                    rows={2}
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Problem Solved"
                    placeholder="What specific architectural or real-world problem does this project address?"
                    rows={2}
                    error={errors.problemSolved?.message}
                    {...register('problemSolved')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Save Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Button type="button" variant="ai" onClick={onNext} className="gap-2">
          <span>Continue to Certifications</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
