export function RoleCycle({ roles }: { roles: string[] }) {
  const role = roles[0] ?? "";

  return (
    <span className="relative inline-block">
      <span className="text-accent star-glow inline-block font-display italic">
        {role}
      </span>
    </span>
  );
}
