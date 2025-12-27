interface ButtonProps {
  onClick?: () => void;
  className?: string;
  text: string;
}

const FillButton = ({ text, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={` box-border font-bold rounded-md hover:opacity-50 pressable ${className}`}
    >
      {text}
    </button>
  );
};

export const UnFillButton = ({ text, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`box-border border font-bold rounded-md hover:opacity-50 pressable ${className}`}
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
  className?: string;
}
export const NormalBlackButton = ({
  onClick,
  text,
  className,
}: NormalButton) => {
  return (
    <FillButton
      onClick={onClick}
      text={text}
      className={`text-white bg-black px-4 py-1 ${className}`}
    />
  );
};

interface LongNormalButton extends NormalButton {
  width: string;
  height: string;
  className?: string;
}

export const LongBlackButton = ({
  onClick,
  text,
  width,
  height,
  className,
}: LongNormalButton) => {
  return (
    <FillButton
      onClick={onClick}
      text={text}
      className={`text-white bg-black ${width} ${height} ${className}`}
    />
  );
};

/*
  unfilled
*/

export const NormalBlackUnFillButton = ({ onClick, text }: NormalButton) => {
  return (
    <UnFillButton
      onClick={onClick}
      text={text}
      className="text-black border-black px-4 py-1"
    />
  );
};

export const NormalRedUnFillButton = ({ onClick, text }: NormalButton) => {
  return (
    <UnFillButton
      onClick={onClick}
      text={text}
      className="text-red-500 border-red-500 px-4 py-1"
    />
  );
};

export const NormalBlueUnFillButton = ({ onClick, text }: NormalButton) => {
  return (
    <UnFillButton
      onClick={onClick}
      text={text}
      className="text-blue-500 border-blue-500 px-4 py-1"
    />
  );
};
