interface TextProps {
  text: string;
  className?: string;
}
export const Text1 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-xs`}>{text}</p>;
};

export const Text2 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-sm`}>{text}</p>;
};

export const Text3 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-base`}>{text}</p>;
};

export const Text4 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-lg`}>{text}</p>;
};

export const Text5 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-xl`}>{text}</p>;
};

export const Text6 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-2xl`}>{text}</p>;
};

export const Text7 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-3xl`}>{text}</p>;
};

export const Text8 = ({ text, className }: TextProps) => {
  return <p className={`${className} text-4xl`}>{text}</p>;
};
