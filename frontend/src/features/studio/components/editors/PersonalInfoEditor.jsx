export function PersonalInfoEditor({ formData, onChange }) {
  const updateField = (field, value) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
          <input
            type="text"
            value={formData.fullName || ''}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="e.g. Jane Doe"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Professional Headline</label>
          <input
            type="text"
            value={formData.headline || ''}
            onChange={(e) => updateField('headline', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="e.g. Senior Full-Stack Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="jane@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">City</label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="San Francisco"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Country</label>
          <input
            type="text"
            value={formData.country || ''}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="United States"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
        <input
          type="text"
          value={formData.linkedin || ''}
          onChange={(e) => updateField('linkedin', e.target.value)}
          className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
          placeholder="https://linkedin.com/in/janedoe"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
          <input
            type="text"
            value={formData.github || ''}
            onChange={(e) => updateField('github', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="https://github.com/janedoe"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Portfolio URL</label>
          <input
            type="text"
            value={formData.portfolio || ''}
            onChange={(e) => updateField('portfolio', e.target.value)}
            className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            placeholder="https://janedoe.dev"
          />
        </div>
      </div>
    </div>
  );
}
