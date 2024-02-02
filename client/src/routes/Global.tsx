import "../App.css";
import { Item } from "../types";
import { useItems } from "../contexts/ItemsProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ItemCmp } from "../components/ItemCmp";

export const Global = () => {
  const navigate = useNavigate();
  const { state, setState, readItem } = useItems();

  useEffect(() => {
    const _readItem = async () => {
      const items = await readItem();
      if (!items) {
        navigate("/login");
      } else {
        setState(() => items);
      }
    };
    _readItem();
  }, []);

  if (!state) return null;
  return (
    <>
      {state.items.map((item: Item) => (
        <ItemCmp item={item} />
      ))}
    </>
  );
};
