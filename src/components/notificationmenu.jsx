"use client";
import { useState, useRef } from "react";
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react";

// Required CSS import, unless you're overriding the styling
import "@knocklabs/react/dist/index.css";

const YourAppLayout = (userID) => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  return (
    <KnockProvider
      apiKey={"pk_test_pEYdIA3silk_jAqYMf3vgFMiDz-_LtT4iWDP5oUIIgw"}
      userId={userID}
    >
      <KnockFeedProvider feedId={"5dc457d4-da3f-46ec-b7fa-89db6fcf582c"}>
        <>
          <NotificationIconButton
            ref={notifButtonRef}
            onClick={(e) => setIsVisible(!isVisible)}
          />
          <NotificationFeedPopover
            buttonRef={notifButtonRef}
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
          />
        </>
      </KnockFeedProvider>
    </KnockProvider>
  );
};
