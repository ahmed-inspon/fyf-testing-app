import {
    Card,
    Page,
    Layout,
    TextContainer,
    Image,
    Stack,
    Select,
    Link,
    Heading,
    IndexTable,
    useIndexResourceState,
    TextStyle,
    Navigation,
    Button,
    Icon,
    FormLayout,
    TextField,
    Label,
  } from "@shopify/polaris";
  import {EditMinor} from '@shopify/polaris-icons';
  import { TitleBar,useNavigate } from "@shopify/app-bridge-react";
  import { useAppQuery, useAuthenticatedFetch } from "../hooks";
  
  import { trophyImage } from "../assets";
  import { ProductsCard,Heading as HeadingWrapper } from "../components";
  import { useEffect, useState,useCallback } from "react";
  import {ColorModal} from "../components";
  export default function Settings() {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();
  
    const [unit,setUnit] = useState("cm");
    const [appearance,setappearance] = useState({
      "btn_title":"Find Your Fit 📐",
      "modal_title":"Find Your Fit",
      "recommend_title":"We recommend you size ",
      "modal_desc":`Want to buy, but you are confused about your size?
      We can help you find your fit for this store.`,
      "modal_desc2":`Fill these measurements so that we can find best fit for you`,
      "next_btn_title":"Next",
      "start_btn_title":"Start Again",
      "close_btn_title":"Close",
      "our_recommendation_title":"Our Recommendation",
      "our_recommendation_desc":"This size is recommended by matching your body measurement with stores defined measurement of their clothing",
      "font_color":"#000000",
      "bg_color":"#ffffff",
      "btn_bg_color":"#ffffff",
      "btn_border_color":"#000000"
    });
  
    
    const fontColor_activator = (
      <div
        style={{
          width: "100%",
          height: "35px",
          backgroundColor: appearance.font_color,
          border: "1px solid gray",
          cursor: "pointer",
        }}
        onClick={() => {
          setFontColorModal(true);
        }}
      />
    );
  
    const bgColor_activator = (
      <div
        style={{
          width: "100%",
          height: "35px",
          backgroundColor: appearance.bg_color,
          border: "1px solid gray",
          cursor: "pointer",
        }}
        onClick={() => {
          setbgColorModal(true);
        }}
      />
    );

    const btnbgColor_activator = (
      <div
        style={{
          width: "100%",
          height: "35px",
          backgroundColor: appearance.btn_bg_color,
          border: "1px solid gray",
          cursor: "pointer",
        }}
        onClick={() => {
          setbtnbgColorModal(true);
        }}
      />
    );

    const btnborderColor_activator = (
      <div
        style={{
          width: "100%",
          height: "35px",
          backgroundColor: appearance.btn_border_color,
          border: "1px solid gray",
          cursor: "pointer",
        }}
        onClick={() => {
          setbtnborderColorModal(true);
        }}
      />
    );

    const handleUnitChange = useCallback((value) => setUnit(value), []);
    const [fontColorModal,setFontColorModal] = useState(false);
    const [bgColorModal,setbgColorModal] = useState(false);
    const [btnbgColorModal,setbtnbgColorModal] = useState(false);
    const [btnborderColorModal,setbtnborderColorModal] = useState(false);

    
    const navigateHandler = () => {
      navigate('/create');
    }
  
    const handleUpdate = async()=>{
      let obj = {unit,appearance};
      const response = await fetch("/api/store_settings",{method:"POST",
                                  headers:{"accept":'application/json',
                                           "content-type":"application/json"},
                                  body:JSON.stringify(obj)});
      const resp = await response.json();
          
          if(response.ok){
              console.log("resp",resp);
              if(resp.success){
                console.log(resp);
              }
          }
    }

    const fetch_settings = async () =>{
      const response = await fetch("/api/store_settings",{method:"GET",
                headers:{"accept":'application/json',"content-type":"application/json"}});
      if(response.ok){
        const resp = await response.json();
        if(resp.data && resp.data){
          if(resp.data.appearance){
            setappearance(resp.data.appearance);
          }
          setUnit(resp.data.unit);
        }     
      }
    }
    useEffect(()=>{
      fetch_settings();
    },[])

    return (
      <Page narrowWidth>
        <TitleBar title="Find Your Fit - Settings"  primaryAction={{"content":"Create","onAction":navigateHandler}} />
        <Layout>
          <Layout.Section>
          <Heading>Store Settings</Heading>
            <Card sectioned>
              <FormLayout>
                  <HeadingWrapper size="16px" weight={400} style={{ marginBottom: 8 }}>
                    1. App Settings
                </HeadingWrapper>
                <Select
                      label="Measurement Unit"
                      options={["cm","inches"]}
                      onChange={handleUnitChange}
                      value={unit}
                      helpText={<span>
                        Default Unit Of Your Store For Measurements
                        </span>}
                  />
                  <HeadingWrapper size="16px" weight={400} style={{ marginBottom: 8 }}>
                    2. Select default appearance of store widget
                </HeadingWrapper>
                  <TextField 
                  type="text"
                  label={"Button Title"}
                  placeholder="Button Title"
                  value={appearance.btn_title}
                  onChange={(val)=>{setappearance({...appearance,btn_title:val})}}
                  />
                  <TextField 
                  type="text"
                  label={"Modal Title"}
                  placeholder="Modal Title"
                  value={appearance.modal_title}
                  onChange={(val)=>{setappearance({...appearance,modal_title:val})}}
                  />
                  <TextField 
                  type="text"
                  label={"Recommend Title"}
                  placeholder="Recommend Title"
                  value={appearance.recommend_title}
                  onChange={(val)=>{setappearance({...appearance,recommend_title:val})}}
                  />
                  <TextField 
                  multiline={true}
                  type="text"
                  label={"Modal Descriptive"}
                  placeholder="Modal Descriptive"
                  value={appearance.modal_desc}
                  onChange={(val)=>{setappearance({...appearance,modal_desc:val})}}
                  />
                  <TextField 
                  multiline={true}
                  type="text"
                  label={"Modal Descriptive 2"}
                  placeholder="Modal Descriptive 2"
                  value={appearance.modal_desc2}
                  onChange={(val)=>{setappearance({...appearance,modal_desc2:val})}}
                  />
                  <TextField 
                  type="text"
                  label={"Next Button Title"}
                  placeholder="Next Button Title"
                  value={appearance.next_btn_title}
                  onChange={(val)=>{setappearance({...appearance,next_btn_title:val})}}
                  />
                  <TextField 
                  type="text"
                  label={"Start Button Title"}
                  placeholder="Start Button Title"
                  value={appearance.start_btn_title}
                  onChange={(val)=>{setappearance({...appearance,start_btn_title:val})}}
                  />
                  <TextField 
                  type="text"
                  label={"Close Button Title"}
                  placeholder="Close Button Title"
                  value={appearance.close_btn_title}
                  onChange={(val)=>{setappearance({...appearance,close_btn_title:val})}}
                  />
                  <TextField 
                  type="text"
                  label={"Our Recommendation Title"}
                  placeholder="Our Recommendation Title"
                  value={appearance.our_recommendation_title}
                  onChange={(val)=>{setappearance({...appearance,our_recommendation_title:val})}}
                  />
                  <TextField 
                  multiline={true}
                  type="text"
                  label={"Our Recommendation Descriptive"}
                  placeholder="Our Recommendation Descriptive"
                  value={appearance.our_recommendation_desc}
                  onChange={(val)=>{setappearance({...appearance,our_recommendation_desc:val})}}
                  />
                  
                  <Label>Select Color Of Fonts</Label>
                  <ColorModal 
                  colorPickerModal={fontColorModal}
                  setColorPickerModal={() => setFontColorModal((c) => !c)}
                  activator={fontColor_activator}
                  color={appearance.font_color}
                  onAccept={(color) => {
                    setappearance({...appearance,font_color:color});
                  }}
                  />
                  <Label>Select Color Of Background</Label>
                  <ColorModal 
                  colorPickerModal={bgColorModal}
                  setColorPickerModal={() => setbgColorModal((c) => !c)}
                  activator={bgColor_activator}
                  color={appearance.bg_color}
                  onAccept={(color) => {
                    setappearance({...appearance,bg_color:color});
                  }}
                  />
                  <Label>Select Color Of Buttons Background</Label>
                  <ColorModal 
                  colorPickerModal={btnbgColorModal}
                  setColorPickerModal={() => setbtnbgColorModal((c) => !c)}
                  activator={btnbgColor_activator}
                  color={appearance.btn_bg_color}
                  onAccept={(color) => {
                    setappearance({...appearance,btn_bg_color:color});
                  }}
                  />
                  <Label>Select Color Of Buttons Borders</Label>
                  <ColorModal 
                  colorPickerModal={btnborderColorModal}
                  setColorPickerModal={() => setbtnborderColorModal((c) => !c)}
                  activator={btnborderColor_activator}
                  color={appearance.btn_border_color}
                  onAccept={(color) => {
                    setappearance({...appearance,btn_border_color:color});
                  }}
                  />
                  <Button onClick={handleUpdate}>Update</Button>
              </FormLayout>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
  