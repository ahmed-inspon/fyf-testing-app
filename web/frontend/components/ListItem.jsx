import styled from "styled-components";

export const ListItem = (props) => {
  const { product, onRemove } = props;
  return (
    <StyledList>
      <div>
        {product.title}
        {/* {product.variants.map((variant, index) => {
          if (variant.title === "Default Title") {
            return null;
          }
          return (
            <span key={index}>
              {index == 0 ? " - " : null}
              {variant.title}
              {index + 1 < product.variants.length ? ", " : null}
            </span>
          );
        })} */}
      </div>

      <span
        className="close-icon"
        onClick={() => onRemove(product.id)}>X</span>
    </StyledList>
  );
};

ListItem.defaultProps = {
  onRemove: () => {},
};

const StyledList = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #d9d9d9;
  margin: 6px 0;

  .close-icon {
    cursor: pointer;
    width: 12px;
  }
`;
