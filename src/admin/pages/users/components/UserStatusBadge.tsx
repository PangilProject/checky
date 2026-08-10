interface Props {
  isActive: boolean;
}

function UserStatusBadge({ isActive }: Props) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full
        ${
          isActive ? "bg-success/15 text-success" : "bg-surface-sunken text-content-muted"
        }`}
    >
      {isActive ? "활성" : "비활성"}
    </span>
  );
}

export default UserStatusBadge;
