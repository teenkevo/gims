import { Font } from "@react-pdf/renderer";

Font.register({
  family: "SpaceGrotesk",
  fonts: [
    {
      src: "/fonts/SpaceGrotesk-Light.ttf",
      fontWeight: 300,
    },
    {
      src: "/fonts/SpaceGrotesk-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/SpaceGrotesk-Medium.ttf",
      fontWeight: 500,
    },
    {
      src: "/fonts/SpaceGrotesk-Bold.ttf",
      fontWeight: 700,
    },
  ],
});
