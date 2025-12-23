interface FillButtonProps {
  onClick?: () => void;
  className?: string;
  text: string;
}

const FillButton = ({ text, onClick, className }: FillButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${className} box-border font-bold rounded-md hover:opacity-50`}
    >
      {text}
    </button>
  );
};

/*
  Button List

*/
interface NormalButton {
  onClick?: () => void;
  text: string;
}
export const NormalBlackButton = ({ onClick, text }: NormalButton) => {
  return (
    <FillButton
      onClick={onClick}
      text={text}
      className="text-white bg-black px-4 py-1"
    />
  );
};

interface LongNormalButton extends NormalButton {
  width: string;
  height: string;
}

export const LongBlackButton = ({
  onClick,
  text,
  width,
  height,
}: LongNormalButton) => {
  return (
    <FillButton
      onClick={onClick}
      text={text}
      className={`text-white bg-black ${width} ${height}`}
    />
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
