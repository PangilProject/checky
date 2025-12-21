interface FillButtonProps {
  onClick?: () => void;
  className?: string;
  text: string;
}

export const FillButton = ({ text, onClick, className }: FillButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${className} box-border w-50 h-10 font-bold rounded-md`}
    >
      {text}
    </button>
  );
};

export const UnFillButton = ({ text, onClick, className }: FillButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${className} border box-border w-50 h-10 font-bold rounded-md`}
    >
      {text}
    </button>
  );
};
