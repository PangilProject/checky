interface Props {
  isActive: boolean;
}

function UserStatusBadge({ isActive }: Props) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full
        ${
          isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
    >
      {isActive ? "활성" : "비활성"}
    </span>
  );
}

export default UserStatusBadge;
