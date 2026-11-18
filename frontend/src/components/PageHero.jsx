import { FiRadio } from "react-icons/fi";

const PageHero = ({
  eyebrow = "MelodyMind",
  title,
  description,
  stat,
  icon: Icon = FiRadio,
  action = null,
  children = null
}) => (
  <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-spotify-green/20 via-white/[0.06] to-transparent p-6 ring-1 ring-white/10 md:p-8">
    <div className="absolute right-8 top-6 hidden h-28 w-28 rounded-full bg-spotify-green/10 blur-2xl md:block" />
    <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-spotify-green">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </p>
        <h1 className="text-4xl font-black text-white">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-spotify-light">{description}</p>}
        {stat && <p className="mt-4 text-sm font-semibold text-white">{stat}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
      {action}
    </div>
  </section>
);

export default PageHero;
