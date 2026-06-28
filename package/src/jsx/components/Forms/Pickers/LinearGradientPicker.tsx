import { useState } from "react";
import { SketchPicker, ColorResult } from "react-color";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { GradientPickerPopover, Palette } from "react-linear-gradient-picker";
import "react-linear-gradient-picker/dist/index.css";

// Function to convert RGB to RGBA
const rgbToRgba = (rgb: string, a: number = 1) =>
  rgb.replace("rgb(", "rgba(").replace(")", `, ${a})`);

// Define props for WrappedSketchPicker
interface WrappedSketchPickerProps {
  onSelect: (color: string, opacity: number | undefined) => void;
  color: string;
  opacity: number;
}

// WrappedSketchPicker component
const WrappedSketchPicker: React.FC<WrappedSketchPickerProps> = ({
  onSelect,
  ...rest
}) => {
  return (
    <SketchPicker
      {...rest}
      color={rgbToRgba(rest.color, rest.opacity)}
      onChange={(c: ColorResult) => {
        const { r, g, b, a } = c.rgb;
        onSelect(`rgb(${r}, ${g}, ${b})`, a);
      }}
    />
  );
};

// Initial palette
const initialPallet: Palette[] = [
  { offset: "0.00", color: "rgb(238, 241, 11)" },
  { offset: "1.00", color: "rgb(126, 32, 207)" },
];

// Gradient component
const Gradient: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [angle, setAngle] = useState<number>(90);
  const [palette, setPalette] = useState<Palette[]>(initialPallet);

  return (
    <GradientPickerPopover
      open={open}
      setOpen={setOpen}
      angle={angle}
      setAngle={setAngle}
      showAnglePicker={true}
      width={220}
      maxStops={3}
      paletteHeight={32}
      palette={palette}
      onPaletteChange={setPalette}
    >
      <WrappedSketchPicker
        color={palette[0].color}
        opacity={1}
        onSelect={(color, opacity) => {
          // Handle color selection
          console.log(color, opacity);
        }}
      />
    </GradientPickerPopover>
  );
};

export default Gradient;
