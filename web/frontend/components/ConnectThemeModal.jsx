import {
    Modal,
    Select,
    Button,
    TextStyle,
    Icon,
    VideoThumbnail,
    SkeletonBodyText,
    Spinner,
  } from "@shopify/polaris";
  import {CircleTickMinor,CircleCancelMinor} from '@shopify/polaris-icons';
  import {video1} from '../assets';
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
    const [showVideo,setShowVideo] = useState(false);
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
        setThemeOS({app_block:false});
        if(resp.ok){
            let respjson = await resp.json();
            console.log("respjson",respjson);
            if(respjson && respjson.data){
              setThemeOS({app_block:respjson.data});
            }
        }
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
      setShowVideo(false);
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
                      
                      <span style={{"margin":'0px'}}><Icon source={CircleTickMinor} color={"success"}></Icon></span>
                      <span style={{marginLeft:'1rem'}}></span>
                      <TextStyle variation="positive" style={{marginLeft:'2rem'}}>App connected with theme!</TextStyle>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{"margin":'0px'}}><Icon source={CircleCancelMinor} color={"critical"} style={{"margin":'0px'}}></Icon></span>
                      <span style={{marginLeft:'1rem'}}></span>
                      <TextStyle variation="negative">
                        App not connected with the theme!
                      </TextStyle>
                    </div>
                  )}
                </>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: '1rem' 
                }}
              >
                <Button
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.REMOTE, {
                      url: `https://${store}/admin/themes/${value}/editor?context=apps&template=product&activateAppId=f9901e53-c767-4506-a6f8-a3560b6b7626/app-embed`,
                      newContext: true,
                    });
                  }}
                >
                  Connect your theme
                </Button>
  
                {(false && themeOS.app_block) ? (
                  <div                     style={{
                    display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: '1rem' }}
                  > <Button
                  addOnBefore={
                    <img
                      alt="export-icon"
                      style={{ marginRight: 8 }}
                      src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/icons/export.svg`}
                    />
                  }
                  onClick={() => {
                    redirect.dispatch(Redirect.Action.REMOTE, {
                      url: `https://${store}/admin/themes/${value}/editor?template=product&activateAppId=f9901e53-c767-4506-a6f8-a3560b6b7626/app-block`,
                      newContext: true,
                    });
                  }}
                >
                  Add App Block (OS 2.0)
                </Button>

                  </div>
                  
                ) : null}
              </div>
          {showVideo ? (
          <iframe width="560" style={{marginTop:'1rem'}} height="400" src="https://www.youtube.com/embed/zzopZBOBHCo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        ):(
              <div style={{ width: 248, margin: "12px auto", textAlign: "center" }}>
                <VideoThumbnail
                  videoLength={48}
                  thumbnailUrl={"https://i9.ytimg.com/vi/zzopZBOBHCo/mq1.jpg?sqp=CLj6uZsG&rs=AOn4CLCo-HS6sE-ROtjYp6FVKwaC3wOqpA"}
                  showVideoProgress
                  onClick={()=>{
                    setShowVideo(true);
                  }}
                  
                />
              </div>
        )}
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
  