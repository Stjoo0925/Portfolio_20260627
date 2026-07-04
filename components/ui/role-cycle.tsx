export function RoleCycle({ roles }: { roles: string[] }) {
  const role = roles[0] ?? "";

  return (
    <span className="relative inline-block">
      <span className="role-cycle-text">
        {role}
      </span>
    </span>
  );
}
