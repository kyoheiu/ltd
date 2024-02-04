import { Item } from "../types";
import { IconCircle } from "@tabler/icons-react";
import { IconSpadeFilled } from "@tabler/icons-react";
import { IconHeartFilled } from "@tabler/icons-react";
import { IconClubsFilled } from "@tabler/icons-react";
import { IconDiamondsFilled } from "@tabler/icons-react";
import { IconArchive } from "@tabler/icons-react";
import { useCallback } from "react";
import { useItems } from "../contexts/ItemsProvider";

const COLOR_ALL = "#fff";
const COLOR_SPADE = "#A5ADCB";
const COLOR_HEART = "#A6DA95";
const COLOR_CLUB = "#EED49F";
const COLOR_DIAMOND = "#ED8796";
const COLOR_ARCHIVED = "#fff";
export const stylesAll: { color: string; sign: JSX.Element }[] = [
  { color: COLOR_ALL, sign: <IconCircle /> },
  { color: COLOR_SPADE, sign: <IconSpadeFilled /> },
  { color: COLOR_HEART, sign: <IconHeartFilled /> },
  { color: COLOR_CLUB, sign: <IconClubsFilled /> },
  { color: COLOR_DIAMOND, sign: <IconDiamondsFilled /> },
  { color: COLOR_ARCHIVED, sign: <IconArchive /> },
];

export const Suits: React.FC<{ item: Item }> = ({ item }: { item: Item }) => {
  const { toggleSuit } = useItems();

  const onClickSuit = useCallback(
    async (_e: React.MouseEvent) => await toggleSuit(item),
    [item]
  );

  return (
    <button onClick={onClickSuit}>
      <div style={{ color: stylesAll[item.suit + 1].color }}>
        {stylesAll[item.suit].sign}
      </div>
    </button>
  );
};
