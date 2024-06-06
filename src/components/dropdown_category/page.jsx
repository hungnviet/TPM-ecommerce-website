"use client";
import React from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  HamburgerMenuIcon,
  DotFilledIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import "./page.css";

const categories = [
  "野菜",
  "果物",
  "米・穀類",
  "お茶",
  "魚介類",
  "肉",
  "卵・乳",
  "蜂蜜",
  "加工食品",
  "花・観葉植物",
];

const DropdownMenuDemo = ({ user_id }) => {
  const [bookmarksChecked, setBookmarksChecked] = React.useState(true);
  const [urlsChecked, setUrlsChecked] = React.useState(false);
  const [person, setPerson] = React.useState("pedro");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="IconButton" aria-label="Customise options">
          カテゴリー
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
          {categories.map((category, index) => (
            <DropdownMenu.Item key={index} className="DropdownMenuItem">
              <Link href={`/homepage/${user_id}/category/${index + 1}`}>
                {category}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default DropdownMenuDemo;
