import {
    Modal,
    Select,
    Button,
    TextStyle,
    VideoThumbnail,
    SkeletonBodyText,
    Spinner,
  } from "@shopify/polaris";
  import { useEffect, useState, useRef } from "react";
  import styled from "styled-components";
  import {Heading} from "../components";
//   import { useAPI, Mutations, errorHandler } from "src/apis/config";
  import { Redirect } from "@shopify/app-bridge/actions";
  import { authenticatedFetch } from "@shopify/app-bridge-utils";
  import { useAppQuery, useAuthenticatedFetch } from "../hooks";

  const ConnectThemeModal = ({ store, visible, onClose, enableStore, redirect }) => {
    /**
     * Ref for interval
     */
    const fetch = useAuthenticatedFetch();
    const intervalRef = useRef();
  
    /**
     * States
     */
    const [options, setOptions] = useState([]);
    const [value, setValue] = useState("");
    const [themeData, setThemeData] = useState({ is_block: false });
    const [themeLoading, toggleThemeLoading] = useState(false);
    const [themeOS, setThemeOS] = useState({ app_block: false });
  
    /**
     * API calls
     */
    const [enableThemeLoading,setenableThemeLoading] = useState(true);
    // const [enableThemeApi, enableThemeLoading] = useAPI(Mutations.enableThemeBlock);
    // const [getAllTheme, getAllThemeLoading] = useAPI(Mutations.getAllThemes);
    // const [checkThemeBlockApi] = useAPI(Mutations.checkThemeBlock);
    // const [checkOSApi] = useAPI(Mutations.checkOS);
  
    /**
     * Check theme OS version
     */
    const checkOS = async ({ shop, theme_id }) => {
      try {
        const resp = await fetch('/api/os_check?theme_id='+theme_id);
        if(resp.ok){
            let respjson = resp.json();
            console.log("respjson",respjson);
        }
        // setThemeOS(data);
      } catch (err) {
        console.log(errorHandler(err));
      }
    };
  
    /**
     * Check if theme block is connected or not
     */
    const checkThemeBlock = async ({ shop, theme_id }) => {
      try {
        const resp = await fetch('/api/check_block_in_theme?theme_id='+theme_id);
        if(resp.ok){
            let respjson = await resp.json();
             setThemeData({is_block:respjson.is_block});
            if (respjson.is_block) {
              stopInterval();
              checkOS({ shop, theme_id });
            } else {
              toggleThemeLoading(false);
            }
            console.log("respjson2",respjson);
        }
       
      } catch (err) {
        console.log(errorHandler(err));
      }
    };
  
    const enablaTheme = async () => {
      try {
        // await enableThemeApi({ store });
        // enableStore();
        closeModal();
      } catch (err) {
        // console.log(errorHandler(err));
      }
    };
  
    const fetch_theme = async () =>{
        if (visible) {
            console.log("runing-------------");
            const response  = await fetch("/api/get_themes");
            if(response.ok){
                let resp = await response.json();
                console.log("resp",resp);
                const mappedData = resp.data.themes?.map((theme) => {
                        if (theme.role === "main") {
                            setValue(`${theme.id}`);
                            startInterval(`${theme.id}`);
                        }
                        return {
                            label: theme.name,
                            value: `${theme.id}`,
                        };
                        });
                setOptions(mappedData);

            }
        }
        if (visible == false) {
            stopInterval();
        }
    }

    useEffect(() => {
        

     fetch_theme();

}, [visible]);
// }, [visible]);
  
    const startInterval = (theme_id) => {
      toggleThemeLoading(true);
      checkThemeBlock({ shop: store, theme_id });
      intervalRef.current = setInterval(() => {
        checkThemeBlock({ shop: store, theme_id });
      }, 10000);
    };
  
    const stopInterval = () => {
      toggleThemeLoading(false);
      clearInterval(intervalRef.current);
    };
  
    const closeModal = () => {
      onClose();
    };
  
    return (
      <Modal open={visible} onClose={closeModal} titleHidden={true}>
        <StyledContent>
          <Heading>Connect Find Your Fit with theme storefront</Heading>
          <br />
          {false ? (
            <div style={{ padding: "48px 0" }}>
              <SkeletonBodyText lines={6} />
            </div>
          ) : (
            <>
              <p style={{ marginBottom: 12 }}>Which theme you want to connect with Find Your Fit?</p>
              <Select
                label=""
                options={options}
                onChange={(value) => {
                  stopInterval();
                  startInterval(value);
                  setValue(value);
                }}
                value={value}
              />
              <br />
              {themeLoading ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Spinner size="small" />
                  <span style={{ width: "8px" }} />
                  <TextStyle variation="positive">Checking theme</TextStyle>
                </div>
              ) : (
                <>
                  {themeData.is_block ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/icons/success.svg`}
                        style={{ marginRight: 8 }}
                        alt="success-icon"
                      />{" "}
                      <TextStyle variation="positive">App connected with theme!</TextStyle>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/icons/error.svg`}
                        style={{ marginRight: 8 }}
                        alt="error-icon"
                      />{" "}
                      <TextStyle variation="negative">
                        App not connected with the theme!
                      </TextStyle>
                    </div>
                  )}
                </>
              )}
  
              <div style={{ width: 248, margin: "12px auto", textAlign: "center" }}>
                <VideoThumbnail
                  videoLength={90}
                  thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                  showVideoProgress
                />
              </div>
  
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  style={{ width: "80%" }}
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.REMOTE, {
                      url: `https://${store}/admin/themes/${value}/editor?context=apps&template=product&activateAppId=ab92ea17-5dbb-4f16-ac05-0ddb0b48990e/app-embed`,
                      newContext: true,
                    });
                  }}
                >
                  Connect your theme
                </Button>
  
                {themeOS.app_block ? (
                  <Button
                    style={{ width: "80%", marginTop: 12 }}
                    addOnBefore={
                      <img
                        alt="export-icon"
                        style={{ marginRight: 8 }}
                        src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/icons/export.svg`}
                      />
                    }
                    onClick={() => {
                      redirect.dispatch(Redirect.Action.REMOTE, {
                        url: `https://${store}/admin/themes/${value}/editor?template=product&activateAppId=76d59ff4-84f6-4fb8-84cb-ba018ca98d89/app-block`,
                        newContext: true,
                      });
                    }}
                  >
                    Add app block
                  </Button>
                ) : null}
                <p style={{ margin: "12px 0" }}>Come back to this tab and click “Next”!</p>
                {themeData.is_block ? (
                  <Button onClick={enablaTheme} loading={enableThemeLoading}>
                    Done
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </StyledContent>
      </Modal>
    );
  };
  
  export default ConnectThemeModal;
  
  const StyledContent = styled.div`
    padding: 16px 32px;
  `;
  