import React from "react";
import { Popover, ColorPicker, Stack, TextField } from "@shopify/polaris";
import { hsbToHex, rgbToHsb } from "@shopify/polaris";

export const ColorModal = ({
  colorPickerModal,
  activator,
  setColorPickerModal,
  color,
  onAccept,
}) => {
  const hexToRgb = (hex) => {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          red: parseInt(result[1], 16),
          green: parseInt(result[2], 16),
          blue: parseInt(result[3], 16),
        }
      : null;
  };

  const [colorHex, setColorHex] = React.useState(color);
  const [colorInHSV, setColorInHSV] = React.useState(rgbToHsb(hexToRgb(color)));
  const colorChangeHandler = (newValue) => {
    setColorHex(newValue);
    if (hexToRgb(newValue) !== null) {
      setColorInHSV(rgbToHsb(hexToRgb(color)));
      onAccept(newValue);
    }
  };
  //console.log(rgbToHsb(hexToRgb(color)));
  return (
    <Popover
      active={colorPickerModal}
      activator={activator}
      onClose={setColorPickerModal}
      zIndexOverride={2147483647}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "250px",
          height: "250px",
          zIndex: 2147483647,
          flexDirection: "column",
        }}
      >
        <ColorPicker
          color={colorInHSV}
          onChange={(c) => {
            let t = hsbToHex(c);
            onAccept(t);
            setColorHex(t);
            setColorInHSV(c);
          }}
        />
        <div style={{ marginTop: "1em", width: 192 }}>
          <Stack wrap={false}>
            <Stack.Item>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: 50,
                  backgroundColor: color,
                  border: "1px solid gray",
                  cursor: "pointer",
                }}
              />
            </Stack.Item>
            <Stack.Item fill>
              <TextField
                value={colorHex}
                onChange={(newValue) => colorChangeHandler(newValue)}
              />
            </Stack.Item>
          </Stack>
        </div>
      </div>
    </Popover>
  );
};
