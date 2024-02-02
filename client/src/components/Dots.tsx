import { Suit } from "../types";
import { IconSpadeFilled } from "@tabler/icons-react";
import { IconHeartFilled } from "@tabler/icons-react";
import { IconClubsFilled } from "@tabler/icons-react";
import { IconDiamondsFilled } from "@tabler/icons-react";

const COLOR_SPADE = "#A5ADCB";
const COLOR_HEART = "#A6DA95";
const COLOR_CLUB = "#EED49F";
const COLOR_DIAMOND = "#ED8796";
const stylesDot: { color: string; sign: JSX.Element }[] = [
  { color: COLOR_SPADE, sign: <IconSpadeFilled /> },
  { color: COLOR_HEART, sign: <IconHeartFilled /> },
  { color: COLOR_CLUB, sign: <IconClubsFilled /> },
  { color: COLOR_DIAMOND, sign: <IconDiamondsFilled /> },
];

export const Suits: React.FC<{ suit: Suit }> = ({ suit }: { suit: Suit }) => {
  return (
    <div style={{ color: stylesDot[suit].color }}>{stylesDot[suit].sign}</div>
  );
};
