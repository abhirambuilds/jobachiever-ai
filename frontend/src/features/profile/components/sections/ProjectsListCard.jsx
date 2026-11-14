import { FolderGit2, Trash2, Github, ExternalLink } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ProjectsListCard() {
  const { profile, removeProject } = useProfile();

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-primary" />
            <span>Key Portfolios &amp; Projects ({profile.projects.length})</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.projects.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                    {item.role && (
                      <span className="text-[11px] text-primary font-medium">{item.role}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProject(item.id)}
                    className="text-muted-foreground hover:text-destructive h-7 w-7"
                    aria-label="Remove project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {item.problemSolved && (
                  <p className="text-xs text-foreground/85">
                    <span className="font-semibold text-primary">Problem:</span> {item.problemSolved}
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
              </div>

              <div className="flex items-center gap-4 text-xs pt-2 border-t border-border/40">
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
          ))}
        </div>

        {profile.projects.length === 0 && (
          <div className="text-xs text-muted-foreground py-4 text-center">
            No projects added.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
