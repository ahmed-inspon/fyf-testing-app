import { Heading as H } from "@shopify/polaris";
import styled from "styled-components";

export const Heading = (props) => {
  const { children, size, color, weight, style } = props;
  return (
    <StyledHeading size={size} color={color} style={style} weight={weight}>
      <H>{children}</H>
    </StyledHeading>
  );
};

Heading.defaultProps = {
  size: "18px",
  color: "#fdb20a",
  weight: 600,
};

const StyledHeading = styled.div`
  .Polaris-Heading {
    color: ${({ color }) => color};
    font-size: ${({ size }) => size};
    font-weight: ${({ weight }) => weight};
  }
`;