import styled from "styled-components";
import {Heading} from "../components";
import { Redirect } from "@shopify/app-bridge/actions";

const PageHeader = ({ connectTheme, redirect }) => {
  return (
    <StyledHeader style={{ display: "flex", justifyContent: "space-between" }}>
      <section className="card card-1">
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: 24 }}>
            <img
              style={{height:120}}
              alt="box-image"
              src={`https://cdn.shopify.com/s/files/applications/acc3aa48fd49f34c2a9c0001ee80eb97_512x512.png?1667833868`}
            />
          </div>

          <div>
            <Heading>Welcome to Find Your Fit</Heading>
            <p>
              Great that you decided to use Find Your Fit! With this app you can define your locals or standard clothing measurements easily. You can add app extension in your theme, most of the customers drop out because they are confused of their sizes, with this app , your sales will boost. Some users do returns because of wrong sizes, this app will reduce returning orders.
            </p>
          </div>
        </div>
      </section>

      <div className="card card-2">
        <div style={{ padding: "12px 0", textAlign: "center" }}>
          <Heading size="16px">Help section</Heading>
          <div
            className="links"
            onClick={() => {
              redirect.dispatch(Redirect.Action.REMOTE, {
                url: `https://inspon.com/docs/`,
                newContext: true,
              });
            }}
          >
            Knowledge Base
          </div>
          <p
            className="links"
            onClick={() => {
              redirect.dispatch(Redirect.Action.REMOTE, {
                url: `https://inspon.com/setup-service/`,
                newContext: true,
              });
            }}
          >
            Setup Service
          </p>
        </div>

        <button className="btn-2" onClick={connectTheme}>
          Connect other Theme
        </button>
      </div>
    </StyledHeader>
  );
};

export default PageHeader;

const StyledHeader = styled.section`
  .card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
    overflow: hidden;
  }
  .card-1 {
    padding: 20px;
    width: calc(100% - 220px);
  }

  .card-2 {
    width: 196px;
    position: relative;
  }

  .btn-2 {
    background-color: #fdb20a;
    border: none;
    outline: none;
    height: 32px;
    color: #fff;
    width: 100%;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .links {
    margin-top: 6px;
    cursor: pointer;
    :hover {
      opacity: 0.8;
    }
  }
`;