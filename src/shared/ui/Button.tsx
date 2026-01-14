/*
  =========================
  Base Button (핵심 책임)
  =========================
*/
interface BaseButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const BaseButton = ({
  text,
  onClick,
  className = "",
  disabled = false,
}: BaseButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`
        box-border rounded-md font-bold transition
        ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "cursor-pointer hover:opacity-80"
        }
        ${className}
      `}
    >
      {text}
    </button>
  );
};

/*
  =========================
  Filled / Unfilled Buttons
  =========================
*/
const FillButton = (props: BaseButtonProps) => {
  return (
    <BaseButton {...props} className={`pressable ${props.className ?? ""}`} />
  );
};

const UnFillButton = (props: BaseButtonProps) => {
  return (
    <BaseButton
      {...props}
      className={`border pressable ${props.className ?? ""}`}
    />
  );
};

/*
  =========================
  Normal Buttons
  =========================
*/
export const NormalBlackButton = (props: BaseButtonProps) => {
  return (
    <FillButton
      {...props}
      className={`bg-black text-white px-4 py-1 ${props.className ?? ""}`}
    />
  );
};

export const NormalBlackUnFillButton = (props: BaseButtonProps) => {
  return (
    <UnFillButton
      {...props}
      className={`border-black text-black px-4 py-1 ${props.className ?? ""}`}
    />
  );
};

export const NormalRedUnFillButton = (props: BaseButtonProps) => {
  return (
    <UnFillButton
      {...props}
      className={`border-red-500 text-red-500 px-4 py-1 ${
        props.className ?? ""
      }`}
    />
  );
};

export const NormalBlueUnFillButton = (props: BaseButtonProps) => {
  return (
    <UnFillButton
      {...props}
      className={`border-blue-500 text-blue-500 px-4 py-1 ${
        props.className ?? ""
      }`}
    />
  );
};

/*
  =========================
  Long Button
  =========================
*/
interface LongButtonProps extends BaseButtonProps {
  width: string;
  height: string;
}

export const LongBlackButton = ({
  width,
  height,
  className,
  ...props
}: LongButtonProps) => {
  return (
    <FillButton
      {...props}
      className={`bg-black text-white ${width} ${height} ${className ?? ""}`}
    />
  );
};
