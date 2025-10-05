import React from "react";
import Zoom from "react-medium-image-zoom";

export const ZoomedMedia = ({ url }: { url?: string }) => {
  return (
    <Zoom>
      <img src={url} alt="Zoomed Media" className="fill-current" />
    </Zoom>
  );
};
